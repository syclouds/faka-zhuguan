/**
 * 复习引擎：掌握度 + 艾宾浩斯间隔 + 复习队列
 * 进度数据模型 progress[cardId] = {
 *   level: 0|1|2,     // 未掌握 | 模糊 | 已掌握
 *   stage: Number,    // 当前处在间隔数组的哪一档
 *   due: Number,      // 下次到期时间戳（当天 00:00）
 *   lastAt: Number,   // 上次复习时间戳
 *   wrong: Number,    // 累计答错/标记不会次数
 *   seen: Number      // 累计查看次数
 * }
 */
const { REVIEW_INTERVALS } = require('./constants');
const store = require('./store');
const { todayStart, daysLater, dayDiff, shuffle } = require('./util');

function readProgress() {
  return store.get('progress', {}) || {};
}

function writeProgress(p) {
  store.set('progress', p);
}

/** 读取单卡进度（无记录返回 level=-1 表示未学） */
function getCardProgress(cardId) {
  const p = readProgress();
  return p[cardId] || { level: -1, stage: 0, due: 0, lastAt: 0, wrong: 0, seen: 0 };
}

/** 掌握度分布统计 */
function levelStats(cards) {
  const p = readProgress();
  const res = { '-1': 0, 0: 0, 1: 0, 2: 0 };
  cards.forEach((c) => {
    const rec = p[c.id];
    res[rec ? rec.level : -1] += 1;
  });
  return res;
}

/**
 * 标记掌握度并推进复习阶段
 * @param {string} cardId
 * @param {0|1|2} level 0未掌握 1模糊 2已掌握
 */
function markLevel(cardId, level) {
  const p = readProgress();
  const old = p[cardId] || { stage: -1, seen: 0, wrong: 0 };
  let stage;
  if (level === 0) {
    stage = 0;                                  // 答错直接回到第一阶段
  } else if (level === 1) {
    stage = Math.max(0, (old.stage || 0));      // 模糊：原地踏步，不进阶
  } else {
    stage = (old.stage === undefined || old.stage < 0) ? 0 : old.stage + 1;
  }

  const intervals = REVIEW_INTERVALS[level] || REVIEW_INTERVALS[1];
  if (stage >= intervals.length) stage = intervals.length - 1;

  p[cardId] = {
    level,
    stage,
    due: daysLater(intervals[stage]),
    lastAt: Date.now(),
    wrong: (old.wrong || 0) + (level === 0 ? 1 : 0),
    seen: (old.seen || 0) + 1
  };
  writeProgress(p);

  // 答错/模糊进入错题本
  if (level === 0) {
    const wrongList = store.get('wrongList', []) || [];
    if (wrongList.indexOf(cardId) === -1) {
      wrongList.push(cardId);
      store.set('wrongList', wrongList);
    }
  }
  return p[cardId];
}

/** 已掌握时从错题本移除 */
function clearWrong(cardId) {
  const wrongList = store.get('wrongList', []) || [];
  const idx = wrongList.indexOf(cardId);
  if (idx > -1) {
    wrongList.splice(idx, 1);
    store.set('wrongList', wrongList);
  }
}

/** 到期复习卡（due <= 今天） */
function dueCards(cards) {
  const p = readProgress();
  const t = todayStart();
  return cards.filter((c) => {
    const rec = p[c.id];
    return rec && rec.due <= t;
  });
}

/** 未学过的卡 */
function newCards(cards) {
  const p = readProgress();
  return cards.filter((c) => !p[c.id]);
}

/**
 * 生成今日学习队列：先到期复习，再按重要度补新卡
 * @param {Array} cards 候选卡池
 * @param {Object} opts { dailyNew, dailyReview }
 */
function buildTodayQueue(cards, opts = {}) {
  const dailyReview = opts.dailyReview || 60;
  const dailyNew = opts.dailyNew || 20;
  const review = shuffle(dueCards(cards)).slice(0, dailyReview);
  const order = { S: 0, A: 1, B: 2, C: 3 };
  const fresh = newCards(cards)
    .sort((a, b) => (order[a.level] || 9) - (order[b.level] || 9))
    .slice(0, dailyNew);
  return { review, fresh, queue: review.concat(fresh) };
}

/** ============ 收藏 ============ */
function getFavorites() {
  return store.get('favorites', []) || [];
}

function isFavorite(id) {
  return getFavorites().some((f) => f.id === id);
}

/** 切换收藏，返回切换后的状态 */
function toggleFavorite(id, type = 'card', title = '') {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.id === id);
  if (idx > -1) {
    list.splice(idx, 1);
    store.set('favorites', list);
    return false;
  }
  list.unshift({ id, type, title, at: Date.now() });
  store.set('favorites', list);
  return true;
}

/** ============ 考试日期 ============ */
function getExamDate() {
  return store.get('examDate', 0) || 0;
}

function setExamDate(ts) {
  store.set('examDate', ts || 0);
}

/** ============ 设置 ============ */
function getSettings() {
  return store.get('settings', { dailyNew: 20, dailyReview: 60, showKeywordTip: true });
}

function saveSettings(patch) {
  const s = Object.assign(getSettings(), patch);
  store.set('settings', s);
  return s;
}

/** ============ 用户自建卡片 ============ */
function getUserCards() {
  return store.get('cards', []) || [];
}

function addUserCard(card) {
  const list = getUserCards();
  list.unshift(Object.assign({ source: 'user', createdAt: Date.now() }, card));
  store.set('cards', list);
  return list;
}

function removeUserCard(id) {
  store.set('cards', getUserCards().filter((c) => c.id !== id));
}

/** ============ 重置 ============ */
function resetAll() {
  store.set('progress', {});
  store.set('wrongList', []);
  store.set('favorites', []);
  store.set('stats', { days: [], totalCards: 0, streak: 0 });
}

/** 学习统计（连续打卡天数 / 今日完成量） */
function touchStat(count = 1) {  const stats = store.get('stats', { days: [], totalCards: 0, streak: 0 }) || { days: [], totalCards: 0, streak: 0 };
  const today = new Date().toDateString();
  let entry = stats.days.find((d) => d.date === today);
  if (!entry) {
    entry = { date: today, count: 0 };
    stats.days.push(entry);
  }
  entry.count += count;
  stats.totalCards = (stats.totalCards || 0) + count;

  // 计算连续天数
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = cursor.toDateString();
    if (stats.days.some((d) => d.date === key && d.count > 0)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1); // 今天还没学，从昨天开始算
    } else {
      break;
    }
  }
  stats.streak = streak;
  store.set('stats', stats);
  return stats;
}

module.exports = {
  readProgress,
  writeProgress,
  getCardProgress,
  levelStats,
  markLevel,
  clearWrong,
  dueCards,
  newCards,
  buildTodayQueue,
  touchStat,
  toggleFavorite,
  isFavorite,
  getFavorites,
  getExamDate,
  setExamDate,
  getSettings,
  saveSettings,
  addUserCard,
  removeUserCard,
  getUserCards,
  resetAll,
  dayDiff
};
