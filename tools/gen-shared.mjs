#!/usr/bin/env node
/**
 * gen-shared.mjs — 小程序 CJS 数据 → 双端共享 ESM（shared/）（ARCH T01.2）
 *
 * 规则（U-8 单向共享）：
 *  - miniprogram/ 源文件只读，一个字不改；
 *  - data/study-*.js / data/essay-templates.js → shared/data/*.js（module.exports → export default）；
 *  - utils/constants.js → shared/constants.js（在原键基础上追加安卓新增 STORAGE_KEYS）；
 *  - utils/util.js → shared/util.js（纯函数原样复制，剔除依赖 wx 的 toast）；
 *  - utils/review.js → shared/review-algo.js（与存储解耦的纯算法，间隔数组/阶段推进/队列筛选逐字等价）；
 *  - shared/package.json 写入 {"type":"module"}，保证 Node 按 ESM 解析 .js。
 *
 * 用法： node tools/gen-shared.mjs
 * 校验： 生成后 88 卡 + 8 模板数量与 node tools/smoke-test.js 一致（脚本尾部自动打印对账）。
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MP = path.join(ROOT, 'miniprogram');
const OUT = path.join(ROOT, 'shared');
const require = createRequire(import.meta.url);

const GEN_HEADER = '// 【生成物】由 tools/gen-shared.mjs 从 miniprogram/ 生成，勿手改；内容唯一事实源是 miniprogram/data/\n';

fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n');

/* ---------- 1. 考点数据 study-*.js ---------- */
const STUDY_FILES = [
  'study-rule-law',
  'study-criminal',
  'study-crim-proc',
  'study-civil',
  'study-civil-proc',
  'study-admin',
  'study-commercial'
];

let cardTotal = 0;
const cardCountBySubject = {};
for (const name of STUDY_FILES) {
  const arr = require(path.join(MP, 'data', `${name}.js`));
  if (!Array.isArray(arr)) throw new Error(`${name}.js 不是数组`);
  cardTotal += arr.length;
  cardCountBySubject[name] = arr.length;
  const body = `/**\n * 【生成物】由 tools/gen-shared.mjs 生成，勿手改。\n * 依据 2026 年公开备考资料整理，以司法部官方公告与现行有效法律法规为准。\n */\nexport default ${JSON.stringify(arr, null, 2)};\n`;
  fs.writeFileSync(path.join(OUT, 'data', `${name}.js`), body);
}

/* ---------- 2. 论述模板 ---------- */
const essays = require(path.join(MP, 'data', 'essay-templates.js'));
fs.writeFileSync(
  path.join(OUT, 'data', 'essay-templates.js'),
  `${GEN_HEADER}export default ${JSON.stringify(essays, null, 2)};\n`
);

/* ---------- 3. constants（追加安卓新增键） ---------- */
const constants = require(path.join(MP, 'utils', 'constants.js'));
const emittedConstants = {
  SUBJECTS: constants.SUBJECTS,
  LEVELS: constants.LEVELS,
  MASTERY: constants.MASTERY,
  REVIEW_INTERVALS: constants.REVIEW_INTERVALS,
  FAV_TYPES: { ...constants.FAV_TYPES, mnemonic: '口诀', case: '案例' },
  STORAGE_KEYS: {
    ...constants.STORAGE_KEYS,
    caseRecords: 'fk_case_records',
    drafts: 'fk_drafts',
    disclaimerAck: 'fk_disclaimer_ack',
    searchHistory: 'fk_search_history'
  }
};
const constBody = `/**
 * 【生成物】由 tools/gen-shared.mjs 生成，勿手改。
 * 在小程序 utils/constants.js 基础上追加安卓端新增键（caseRecords/drafts/disclaimerAck/searchHistory）。
 * 依据 2026 年公开备考资料整理，以司法部官方公告与现行有效法律法规为准。
 */

export const SUBJECTS = ${JSON.stringify(emittedConstants.SUBJECTS, null, 2)};

export const LEVELS = ${JSON.stringify(emittedConstants.LEVELS, null, 2)};

export const MASTERY = ${JSON.stringify(emittedConstants.MASTERY, null, 2)};

/** 艾宾浩斯复习间隔（天）：掌握度越低，间隔越短（与小程序逐字一致，ARCH §9.6） */
export const REVIEW_INTERVALS = ${JSON.stringify(emittedConstants.REVIEW_INTERVALS, null, 2)};

/** 收藏/错题展示名 */
export const FAV_TYPES = ${JSON.stringify(emittedConstants.FAV_TYPES, null, 2)};

/** 本地存储 key（fk_* 前缀，与小程序互通，保证备份文件兼容） */
export const STORAGE_KEYS = ${JSON.stringify(emittedConstants.STORAGE_KEYS, null, 2)};

export default { SUBJECTS, LEVELS, MASTERY, REVIEW_INTERVALS, FAV_TYPES, STORAGE_KEYS };
`;
fs.writeFileSync(path.join(OUT, 'constants.js'), constBody);

/* ---------- 4. util（纯函数，剔除 wx.toast） ---------- */
const utilBody = `/**
 * 【生成物】由 tools/gen-shared.mjs 生成，勿手改。
 * 复制自小程序 utils/util.js 的纯函数（剔除依赖 wx 的 toast）。
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 把日期归零到当天 00:00 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 今天 00:00 的时间戳 */
export function todayStart() {
  return startOfDay(new Date()).getTime();
}

/** 相对天数差（正数表示未来） */
export function dayDiff(ts) {
  return Math.round((startOfDay(ts).getTime() - todayStart()) / MS_PER_DAY);
}

/** n 天后 00:00 的时间戳 */
export function daysLater(n) {
  return todayStart() + n * MS_PER_DAY;
}

/** 格式化为 YYYY-MM-DD */
export function formatDate(ts) {
  const d = new Date(ts);
  const m = \`\${d.getMonth() + 1}\`.padStart(2, '0');
  const day = \`\${d.getDate()}\`.padStart(2, '0');
  return \`\${d.getFullYear()}-\${m}-\${day}\`;
}

/** 距离考试天数 */
export function daysUntil(ts) {
  return Math.max(0, dayDiff(ts));
}

/** 洗牌（Fisher–Yates，不改原数组） */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 字数统计（中文按字算） */
export function charCount(str) {
  return (str || '').replace(/\\s/g, '').length;
}
`;
fs.writeFileSync(path.join(OUT, 'util.js'), utilBody);

/* ---------- 5. review-algo（与存储解耦的纯算法） ---------- */
const algoBody = `/**
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
`;
fs.writeFileSync(path.join(OUT, 'review-algo.js'), algoBody);

/* ---------- 6. 对账输出 ---------- */
console.log('[gen-shared] 生成完成：');
for (const name of STUDY_FILES) {
  console.log(`  shared/data/${name}.js  ${cardCountBySubject[name]} 卡`);
}
console.log(`  shared/data/essay-templates.js  ${essays.length} 模板`);
console.log(`  合计：考点 ${cardTotal} 卡 + 论述 ${essays.length} 模板`);
console.log('[gen-shared] 下一步校验：node tools/smoke-test.js（小程序端）与构建后冒烟数量比对');
