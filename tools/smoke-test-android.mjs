#!/usr/bin/env node
/**
 * 安卓工程数据与算法冒烟测试（Node 环境，无框架，ARCH T02.4）
 * 等价迁移小程序 tools/smoke-test.js 的 25 项 + 安卓新增项（存储三层/命中判定/法条归一化/
 * 备份往返/路由栈/案例自评）。
 * 运行： node tools/smoke-test-android.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'faka-android', 'src');

/** Windows 下动态 import 必须用 file:// URL */
const load = (p) => import(pathToFileURL(p).href);

/* ---------- 加载被测模块（TS 直接以 type-stripping 加载；shared 为 ESM JS） ---------- */
const judge = await load(path.join(SRC, 'core', 'judge.ts'));
const store = await load(path.join(SRC, 'core', 'store.ts'));
const review = await load(path.join(SRC, 'core', 'review.ts'));
const catalog = await load(path.join(SRC, 'core', 'catalog.ts'));
const search = await load(path.join(SRC, 'core', 'search.ts'));
const clause = await load(path.join(SRC, 'core', 'clause.ts'));
const casesCore = await load(path.join(SRC, 'core', 'cases.ts'));
const backup = await load(path.join(SRC, 'core', 'backup.ts'));
const routerMod = await load(path.join(SRC, 'router', 'stack.ts'));
const sharedUtil = await load(path.join(ROOT, 'shared', 'util.js'));
const sharedAlgo = await load(path.join(ROOT, 'shared', 'review-algo.js'));

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

const router = routerMod.router;

/* ================= 1. 数据结构完整性 ================= */
console.log('\n=== 1. 数据结构完整性（等价小程序 smoke-test 1/2 节） ===');
const stat = catalog.getCatalogStats();
console.log(`  科目 ${stat.totalSubjects}｜考点 ${stat.totalCards}｜S级 ${stat.totalSLevel}｜论述 ${stat.totalEssay}｜口诀 ${stat.totalMnemonics}｜案例 ${stat.totalCases}（${stat.totalQuestions} 问）`);

const REQUIRED = ['id', 'chapter', 'title', 'level', 'core', 'points', 'clauses', 'trick'];
const ids = new Set();
let badCard = null;
catalog.ALL_CARDS.forEach((c) => {
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
  if (c.kind !== 'card') badCard = `${c.id} kind 未注入`;
});
assert('所有考点字段完整且 id 唯一（kind/subject 已注入）', !badCard, badCard || '');

const emptySubject = catalog.getSubjectsWithChapters().filter((s) => s.total === 0);
assert('每个科目都有考点', emptySubject.length === 0, emptySubject.map((s) => s.id).join(','));

assert('考点总数 ≥ 80', stat.totalCards >= 80, `实际 ${stat.totalCards}`);
assert('shared 与小程序对账：基础 88 卡 + 法治思想补丁 5 卡 + 8 模板', stat.totalCards === 93 && stat.totalEssay === 8, `实际 ${stat.totalCards}/${stat.totalEssay}`);
const ruleLawSubj = catalog.getSubjectsWithChapters().find((s) => s.id === 'rule-law');
const baseOthers = stat.totalCards - (ruleLawSubj ? ruleLawSubj.total : -1);
assert('法治思想 12→17（T03 补丁），其余六科基础 76 卡不变', ruleLawSubj && ruleLawSubj.total === 17 && baseOthers === 76, `rule-law=${ruleLawSubj ? ruleLawSubj.total : 'N/A'}, others=${baseOthers}`);

/* ================= 2. 论述模板 ================= */
console.log('\n=== 2. 论述模板（等价原第 3 节） ===');
for (const e of catalog.ESSAYS) {
  assert(`模板 [${e.id}] ${e.title.slice(0, 18)}`, e.frame.length >= 3 && e.phrases.length >= 3 && !!e.trap);
}

/* ================= 3. 复习算法（等价原第 4 节 + 红线逐字） ================= */
console.log('\n=== 3. 复习算法（三档间隔逐字等价 ARCH §9.6） ===');
assert('间隔数组逐字等价 [0,1,1,2,4,7,15]/[1,2,4,7,15,30]/[3,7,15,30,60]',
  JSON.stringify(sharedAlgo.REVIEW_INTERVALS[0]) === '[0,1,1,2,4,7,15]' &&
  JSON.stringify(sharedAlgo.REVIEW_INTERVALS[1]) === '[1,2,4,7,15,30]' &&
  JSON.stringify(sharedAlgo.REVIEW_INTERVALS[2]) === '[3,7,15,30,60]',
  JSON.stringify(sharedAlgo.REVIEW_INTERVALS));

store.set('progress', {});
store.set('wrongList', []);
store.set('stats', { days: [], totalCards: 0, streak: 0 });
store.set('favorites', []);

const testCard = catalog.ALL_CARDS[0];
let p = review.getCardProgress(testCard.id);
assert('未学卡片 level = -1', p.level === -1);

review.markLevel(testCard.id, 0);
p = review.getCardProgress(testCard.id);
assert('标记"没记住"后 level=0 且 stage=0', p.level === 0 && p.stage === 0);
assert('"没记住"进入错题本', (store.get('wrongList', []) || []).includes(testCard.id));

review.markLevel(testCard.id, 2);
p = review.getCardProgress(testCard.id);
assert('标记"记住了"后 level=2 且 stage=1', p.level === 2 && p.stage === 1);
assert('已掌握后 due > 今天（本地当天 00:00 基准）', p.due > sharedUtil.todayStart());

review.markLevel(testCard.id, 0);
p = review.getCardProgress(testCard.id);
assert('再次答错 stage 归零（艾宾浩斯回退）', p.stage === 0);

const allItems = catalog.allRecitableItems();
const q = review.buildTodayQueue(allItems, { dailyNew: 20, dailyReview: 60 });
assert('今日队列 = 复习 + 新学', q.queue.length === q.review.length + q.fresh.length);
assert('新学不超过上限 20', q.fresh.length <= 20, `实际 ${q.fresh.length}`);

/* ================= 4. 命中判定（与小程序 onCheckAll 逐字等价） ================= */
console.log('\n=== 4. 默写命中判定 ===');
assert('完整命中：答案包含于输入', judge.judgeHit('正当防卫五要件', '正当防卫') === true);
assert('输入包含于答案（子串即命中）', judge.judgeHit('正当', '正当防卫') === true);
assert('60% 长度兜底：3 字乱序"卫正防" ≥ ceil(4*0.6)', judge.judgeHit('卫正防', '正当防卫') === true);
assert('过短且非子串不命中：2 字乱序"防当" < 3', judge.judgeHit('防当', '正当防卫') === false);
assert('空输入不命中', judge.judgeHit('', '正当防卫') === false);
assert('纯空白输入不命中（去空白后判定）', judge.judgeHit('   ', '正当防卫') === false);
assert('空白穿插等效：输"正当 防卫"命中', judge.judgeHit('正当 防卫', '正当防卫') === true);

/* ================= 5. 存储三层（同步签名 + Node 安全降级） ================= */
console.log('\n=== 5. 存储层 get/set/remove（同步签名） ===');
store.set('progress', { 'x-1': { level: 1, stage: 2, due: 123, lastAt: 1, wrong: 0, seen: 3 } });
assert('对象值 set/get 往返一致', (store.get('progress', {}) || {})['x-1'].stage === 2);
assert('缺失键返回默认值', store.get('nonexistent-key', 'def') === 'def');
store.set('examDate', 123456);
assert('数字值往返', store.get('examDate', 0) === 123456);
store.remove('examDate');
assert('remove 后回到默认值', store.get('examDate', 0) === 0);
store.set('progress', {});
store.set('wrongList', []);
store.set('stats', { days: [], totalCards: 0, streak: 0 });
store.set('caseRecords', {});
let hydrateOk = true;
try {
  await store.hydrate();
} catch (err) {
  hydrateOk = false;
}
assert('hydrate() 在 Node 环境安全完成（不触碰 Capacitor）', hydrateOk === true);

/* ================= 6. 检索（等价原第 5 节 + 五分组） ================= */
console.log('\n=== 6. 全文检索 ===');
for (const kw of ['正当防卫', '非法证据', '善意取得', '一事不再罚', '人格否认']) {
  const hit = search.searchCards(kw);
  assert(`检索「${kw}」`, hit.length > 0, `命中 ${hit.length}`);
}
const allRes = search.searchAll('刑诉');
assert('searchAll 五分组齐全 + 法条直达字段',
  Array.isArray(allRes.cards) && Array.isArray(allRes.mnemonics) &&
  Array.isArray(allRes.cases) && Array.isArray(allRes.essays) &&
  Array.isArray(allRes.clauses) && ('clauseDirect' in allRes));

const history0 = search.getSearchHistory().length;
search.addSearchHistory('十一个坚持');
search.addSearchHistory('非法证据');
search.addSearchHistory('十一个坚持');
const history = search.getSearchHistory();
assert('搜索历史去重置顶且持久化', history[0] === '十一个坚持' && history.includes('非法证据') && history.length === history0 + 2);
search.clearSearchHistory();

/* ================= 7. 法条号归一化（B-2） ================= */
console.log('\n=== 7. 法条归一化 ===');
assert('「刑诉法 16」→ 刑事诉讼法|16', clause.normalizeClause('刑诉法 16') === '刑事诉讼法|16', clause.normalizeClause('刑诉法 16'));
assert('「《刑事诉讼法》第16条」→ 同键', clause.normalizeClause('《刑事诉讼法》第16条') === '刑事诉讼法|16');
assert('「刑事诉讼法第十六条」中文数字 → 同键', clause.normalizeClause('刑事诉讼法第十六条') === '刑事诉讼法|16');
assert('非法输入返回 null', clause.normalizeClause('hello') === null);

/* ================= 8. 案例自评与错题回流（U-4 单采分点粒度） ================= */
console.log('\n=== 8. 案例训练自评 ===');
assert('复合 id 组装/解析往返', (() => {
  const cid = casesCore.compoundId('case-civ-001', 'q1', 'sp-2');
  const parsed = casesCore.parseWrongRef(cid);
  return parsed && parsed.caseId === 'case-civ-001' && parsed.qid === 'q1' && parsed.spId === 'sp-2';
})());
assert('考点卡 id 解析为 null（不误判案例）', casesCore.parseWrongRef('crimpro-02') === null);

casesCore.recordPoint('case-t-001', 'q1', 'sp-1', true);
casesCore.recordPoint('case-t-001', 'q1', 'sp-2', false);
let rec = casesCore.getCaseRecords()['case-t-001'];
assert('自评 1 中 1 未中 → 踩中率 0.5', rec && rec.hit.length === 1 && rec.miss.length === 1 && Math.abs(rec.rate - 0.5) < 1e-9, JSON.stringify(rec));

const wrongBefore = (store.get('wrongList', []) || []).length;
casesCore.finishCase('case-t-001');
rec = casesCore.getCaseRecords()['case-t-001'];
const wrongAfter = store.get('wrongList', []) || [];
assert('finishCase：attempts+1 且未答到回流错题本',
  rec.attempts === 1 && wrongAfter.length === wrongBefore + 1 && wrongAfter.includes('case-t-001#q1#sp-2'));

/* ================= 9. 备份导出/导入往返（C-2，schema 闸门） ================= */
console.log('\n=== 9. 备份往返 ===');
review.markLevel('crimpro-01', 1);
const snap = backup.buildBackup();
assert('buildBackup：schema=1 + 8 类数据齐全',
  snap.schema === 1 && snap.app === 'faka-android' &&
  ['progress', 'settings', 'stats', 'wrongList', 'favorites', 'userCards', 'caseRecords', 'drafts'].every((k) => k in snap.data));

const invalid = await backup.importBackup(JSON.stringify({ schema: 2, app: 'faka-android', data: {} }));
assert('schema≠1 明确报错不崩溃', invalid.ok === false && /版本不兼容/.test(invalid.reason), JSON.stringify(invalid));

const wrongSnapshot = (store.get('wrongList', []) || []).slice();
store.set('progress', {});
store.set('wrongList', []);
const restored = await backup.importBackup(JSON.stringify(snap));
const progressRestored = store.get('progress', {}) || {};
assert('导出 → 清空 → 导入：进度与错题逐一一致',
  restored.ok === true &&
  progressRestored['crimpro-01']?.level === 1 &&
  JSON.stringify(store.get('wrongList', []) || []) === JSON.stringify(wrongSnapshot));

/* ================= 10. 路由栈（ARCH §6.2 全部规则） ================= */
console.log('\n=== 10. 页面栈 ===');
assert('初始：home 栈深度 1（Tab 根）', router.depth() === 1 && router.top().name === 'home');
router.push('recite', { mode: 'today' });
assert('push 后深度 2 且栈顶 recite', router.canPop() && router.top().name === 'recite' && router.top().params.mode === 'today');
assert('pop 回栈根', router.pop() === true && router.depth() === 1);

router.push('chapter', { subject: 'crim-proc' });
router.push('recite', { mode: 'chapter' });
router.popTo('chapter');
assert('popTo 回到指定页（清掉其上页面）', router.depth() === 2 && router.top().name === 'chapter');

router.replace('recite', { cardId: 'crimpro-01' });
assert('replace 替换栈顶', router.top().name === 'recite' && router.top().params.cardId === 'crimpro-01');
router.pop();

router.switchTab('mine');
assert('switchTab 独立栈：mine 栈深 1，home 栈状态保留',
  router.activeTab === 'mine' && router.depth('mine') === 1 && router.depth('home') === 1);

router.setLeaveGuard(() => true);
assert('离场守卫返回 true → handleBack 消费', router.handleBack() === 'consumed');
router.setLeaveGuard(() => false);
router.exitArmedAt = 0;
const r1 = router.handleBack();
const r2 = router.handleBack();
assert('根页双击退出：armed → exit', r1 === 'armed' && r2 === 'exit', `${r1}/${r2}`);

const parsedHash = router.parseHash('#/recite?mode=today');
assert('hash 解析：#/recite?mode=today', parsedHash && parsedHash.name === 'recite' && parsedHash.params.mode === 'today');
assert('未知路由 hash → null', router.parseHash('#/nope') === null);

/* ================= 结果 ================= */
console.log(`\n================ 结果：PASS ${pass}｜FAIL ${fail} ================\n`);
process.exit(fail ? 1 : 0);
