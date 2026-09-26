/**
 * 【生成物】由 tools/gen-shared.mjs 生成，勿手改。
 * 抽取自小程序 utils/review.js 的纯算法（与存储解耦）。
 * 红线（ARCH §9.6）：三档间隔数组原样 [0,1,1,2,4,7,15] / [1,2,4,7,15,30] / [3,7,15,30,60]；
 * stage 推进规则逐字等价：0→归零；1→原地；2→+1（未学从 0 起步）。
 */
import { todayStart, daysLater } from './util.js';

export const REVIEW_INTERVALS = {
  0: [0, 1, 1, 2, 4, 7, 15],
  1: [1, 2, 4, 7, 15, 30],
  2: [3, 7, 15, 30, 60]
};

/** 无记录时的空白进度（level=-1 表示未学） */
export function emptyProgress() {
  return { level: -1, stage: 0, due: 0, lastAt: 0, wrong: 0, seen: 0 };
}

/**
 * 计算标记后的 stage
 * @param {0|1|2} level 0未掌握 1模糊 2已掌握
 * @param {number} prevStage 旧 stage（无记录传 -1）
 */
export function computeStage(level, prevStage) {
  if (level === 0) return 0;
  if (level === 1) return Math.max(0, prevStage || 0);
  return prevStage === undefined || prevStage === null || prevStage < 0 ? 0 : prevStage + 1;
}

/**
 * 计算标记后的完整进度记录（不落盘）
 * @param {Record<string, {level:number,stage:number,due:number,lastAt:number,wrong:number,seen:number}>} prev 旧记录（可空）
 */
export function computeRecord(level, prev) {
  const old = prev || { stage: -1, seen: 0, wrong: 0 };
  let stage = computeStage(level, old.stage);
  const intervals = REVIEW_INTERVALS[level] || REVIEW_INTERVALS[1];
  if (stage >= intervals.length) stage = intervals.length - 1;
  return {
    level,
    stage,
    due: daysLater(intervals[stage]),
    lastAt: Date.now(),
    wrong: (old.wrong || 0) + (level === 0 ? 1 : 0),
    seen: (old.seen || 0) + 1
  };
}

/** 到期复习卡（due <= 今天 00:00） */
export function filterDue(cards, progress) {
  const t = todayStart();
  return cards.filter((c) => {
    const rec = progress[c.id];
    return rec && rec.due <= t;
  });
}

/** 未学过的卡 */
export function filterNew(cards, progress) {
  return cards.filter((c) => !progress[c.id]);
}

/**
 * 生成今日学习队列：先到期复习（洗牌截断），再按重要度补新卡
 * @param {Array} cards 候选卡池
 * @param {Record<string, any>} progress 进度 map
 * @param {{dailyNew?:number, dailyReview?:number}} opts
 * @param {(arr:Array)=>Array} shuffleFn 洗牌函数（依赖注入，便于测试）
 */
export function buildQueue(cards, progress, opts = {}, shuffleFn) {
  const sh = shuffleFn || ((a) => a.slice());
  const dailyReview = opts.dailyReview || 60;
  const dailyNew = opts.dailyNew || 20;
  const review = sh(filterDue(cards, progress)).slice(0, dailyReview);
  const order = { S: 0, A: 1, B: 2, C: 3 };
  const fresh = filterNew(cards, progress)
    .sort((a, b) => (order[a.level] || 9) - (order[b.level] || 9))
    .slice(0, dailyNew);
  return { review, fresh, queue: review.concat(fresh) };
}

/** 掌握度分布统计（-1 未学 / 0 / 1 / 2） */
export function levelStats(cards, progress) {
  const res = { '-1': 0, 0: 0, 1: 0, 2: 0 };
  cards.forEach((c) => {
    const rec = progress[c.id];
    res[rec ? rec.level : -1] += 1;
  });
  return res;
}
