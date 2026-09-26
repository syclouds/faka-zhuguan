/**
 * 数据与算法冒烟测试（Node 环境，模拟 wx 全局对象）
 * 运行： node tools/smoke-test.js
 */
const path = require('path');

// ---------- 模拟 wx 环境 ----------
const storage = {};
global.wx = {
  getStorageSync: (k) => (k in storage ? storage[k] : ''),
  setStorageSync: (k, v) => { storage[k] = v; },
  removeStorageSync: (k) => { delete storage[k]; },
  showToast: () => {},
  cloud: null
};
global.getApp = () => global.__app || null;

// ---------- 加载模块 ----------
const DATA_DIR = path.join(__dirname, '..', 'miniprogram');
const db = require(path.join(DATA_DIR, 'data', 'index.js'));
const review = require(path.join(DATA_DIR, 'utils', 'review.js'));

let pass = 0;
let fail = 0;

function assert(name, cond, extra = '') {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

console.log('\n=== 1. 数据结构完整性 ===');
const stat = db.getStats();
console.log(`  科目数 ${stat.totalSubjects}｜考点 ${stat.totalCards}｜S级 ${stat.totalSLevel}｜论述模板 ${stat.totalEssay}`);

const REQUIRED = ['id', 'chapter', 'title', 'level', 'core', 'points', 'clauses', 'trick'];
const ids = new Set();
let badCard = null;
db.ALL_CARDS.forEach((c) => {
  if (ids.has(c.id)) badCard = `重复 id: ${c.id}`;
  ids.add(c.id);
  REQUIRED.forEach((k) => {
    if (c[k] === undefined || c[k] === null) badCard = `${c.id} 缺少字段 ${k}`;
  });
  if (!Array.isArray(c.points) || c.points.length === 0) badCard = `${c.id} points 为空`;
  c.points.forEach((p) => {
    if (!p.k || !p.v) badCard = `${c.id} 存在空采分点`;
  });
  if (!['S', 'A', 'B', 'C'].includes(c.level)) badCard = `${c.id} level 非法: ${c.level}`;
});
assert('所有考点字段完整且 id 唯一', !badCard, badCard || '');

const emptySubject = db.SUBJECTS.filter((s) => db.getCardsBySubject(s.id).length === 0);
assert('每个科目都有考点', emptySubject.length === 0, emptySubject.map((s) => s.name).join(','));

console.log('\n=== 2. 分科统计 ===');
db.SUBJECTS.forEach((s) => {
  const cards = db.getCardsBySubject(s.id);
  const sCount = cards.filter((c) => c.level === 'S').length;
  console.log(`  ${s.name.padEnd(8, '　')} ${String(cards.length).padStart(3)} 个考点（S级 ${sCount}）｜章节 ${db.getSubjectsWithChapters().find((x) => x.id === s.id).chapters.length}`);
});
assert('考点总数 ≥ 80', db.ALL_CARDS.length >= 80, `实际 ${db.ALL_CARDS.length}`);

console.log('\n=== 3. 论述模板 ===');
db.getEssays().forEach((e) => {
  assert(`模板 [${e.id}] ${e.title.slice(0, 18)}`, e.frame.length >= 3 && e.phrases.length >= 3 && !!e.trap);
});

console.log('\n=== 4. 复习算法 ===');
storage.fk_progress = {};
storage.fk_wrong = [];
storage.fk_stats = { days: [], totalCards: 0, streak: 0 };

const testCard = db.ALL_CARDS[0];
let p = review.getCardProgress(testCard.id);
assert('未学卡片 level = -1', p.level === -1);

review.markLevel(testCard.id, 0);
p = review.getCardProgress(testCard.id);
assert('标记"没记住"后 level=0 且 stage=0', p.level === 0 && p.stage === 0);
assert('"没记住"进入错题本', (storage.fk_wrong || []).includes(testCard.id));

review.markLevel(testCard.id, 2);
p = review.getCardProgress(testCard.id);
assert('标记"记住了"后 level=2 且 stage=1', p.level === 2 && p.stage === 1);
assert('已掌握后 due > 今天', p.due > require(path.join(DATA_DIR, 'utils', 'util.js')).todayStart());

review.markLevel(testCard.id, 0);
p = review.getCardProgress(testCard.id);
assert('再次答错 stage 归零（艾宾浩斯回退）', p.stage === 0);

const q = review.buildTodayQueue(db.ALL_CARDS, { dailyNew: 20, dailyReview: 60 });
assert('今日队列 = 复习 + 新学', q.queue.length === q.review.length + q.fresh.length);
assert('新学不超过上限 20', q.fresh.length <= 20, `实际 ${q.fresh.length}`);

console.log('\n=== 5. 检索 ===');
['正当防卫', '非法证据', '善意取得', '一事不再罚', '人格否认'].forEach((kw) => {
  const hit = db.searchCards(kw);
  assert(`检索「${kw}」`, hit.length > 0, `命中 ${hit.length}`);
});

console.log('\n=== 6. 章节索引一致性 ===');
let chapterBad = null;
db.SUBJECTS.forEach((s) => {
  const total = db.getCardsBySubject(s.id).length;
  let acc = 0;
  const withCh = db.getSubjectsWithChapters().find((x) => x.id === s.id);
  withCh.chapters.forEach((_, i) => {
    acc += db.getCardsByChapterId(s.id, i).cards.length;
  });
  if (acc !== total) chapterBad = `${s.name}: 章节累计 ${acc} != 总数 ${total}`;
});
assert('章节索引与实际卡片数一致', !chapterBad, chapterBad || '');

console.log(`\n================ 结果：PASS ${pass}｜FAIL ${fail} ================\n`);
process.exit(fail ? 1 : 0);
