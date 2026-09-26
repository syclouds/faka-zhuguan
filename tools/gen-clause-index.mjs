/**
 * gen-clause-index.mjs — 扫描 shared/data 全部数据，反向生成法条索引（B-2，ARCH §4.5）
 *
 * 用法（Node 22）：
 *   node tools/gen-clause-index.mjs
 *
 * 扫描来源：
 *   - study-*.js         → cards[].clauses[]（自由文本，可归一化的提取）
 *   - mnemonics-*.js     → clauseIndex[]（U-2: string[]）
 *   - cases-*.js         → questions[].clauseIndex[]
 *
 * 归一化规则与 faka-android/src/core/clause.ts 保持同步（LAW_ALIASES + 中文数字），
 * 修改任一侧时须同步另一侧。生成物写入 shared/data/clause-index.js。
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHARED_DATA = join(__dirname, '..', 'shared', 'data');

/* ---------- 法条归一化（与 core/clause.ts 同步） ---------- */

const LAW_ALIASES = {
  刑事诉讼法: '刑事诉讼法',
  刑诉法: '刑事诉讼法',
  刑诉: '刑事诉讼法',
  刑诉解释: '刑诉解释',
  刑诉法解释: '刑诉解释',
  高法解释: '刑诉解释',
  刑法: '刑法',
  刑法修正案十一: '刑法',
  民法典: '民法典',
  民法: '民法典',
  民诉法: '民事诉讼法',
  民事诉讼法: '民事诉讼法',
  民诉: '民事诉讼法',
  民诉解释: '民诉解释',
  行政诉讼法: '行政诉讼法',
  行政复议法: '行政复议法',
  行政处罚法: '行政处罚法',
  行政强制法: '行政强制法',
  公司法: '公司法',
  企业破产法: '企业破产法',
  破产法: '企业破产法',
  宪法: '宪法',
  监察法: '监察法',
  人民陪审员法: '人民陪审员法',
  法律援助法: '法律援助法'
};

const CN_DIGIT = { 零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };

/** 中文数字 → 阿拉伯数字 */
function cnNumberToArabic(cn) {
  if (!cn) return null;
  if (/^\d+$/.test(cn)) return parseInt(cn, 10);
  let total = 0;
  let current = 0;
  for (const ch of cn) {
    if (ch === '零') continue;
    if (CN_DIGIT[ch] !== undefined) current = CN_DIGIT[ch];
    else if (ch === '十') { total += (current || 1) * 10; current = 0; }
    else if (ch === '百') { total += (current || 1) * 100; current = 0; }
    else if (ch === '千') { total += (current || 1) * 1000; current = 0; }
    else return null;
  }
  return total + current || null;
}

/** 归一化法名 */
function normalizeLaw(raw) {
  const law = (raw || '').replace(/[《》\s]/g, '').replace(/中华人民共和国/g, '');
  if (!law) return null;
  if (LAW_ALIASES[law]) return LAW_ALIASES[law];
  for (const alias of Object.keys(LAW_ALIASES)) {
    if (law.includes(alias)) return LAW_ALIASES[alias];
  }
  return null;
}

/** 归一化输入为 '法名|条号'；无法解析返回 null */
export function normalizeClause(input) {
  const s = (input || '').trim().replace(/[《》\s（）()]/g, '');
  if (!s) return null;
  const m = s.match(/^(.+?)(?:第)?([0-9一二三四五六七八九十百零]+)条?$/);
  if (!m) return null;
  const law = normalizeLaw(m[1]);
  const article = cnNumberToArabic(m[2]);
  if (!law || article === null) return null;
  return `${law}|${article}`;
}

/* ---------- 数据扫描 ---------- */

/** 静态导入 shared/data 下全部 .js 数据文件（跳过生成物自身与 index 类） */
async function loadAllData() {
  const files = readdirSync(SHARED_DATA).filter((f) => f.endsWith('.js') && f !== 'clause-index.js' && f !== 'constants.js' && f !== 'util.js' && f !== 'review-algo.js');
  const out = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(SHARED_DATA, f)).href);
    const data = mod.default;
    if (!Array.isArray(data)) continue;
    out.push({ file: f, data });
  }
  return out;
}

/** 主扫描：收集 code → Set(refs) */
async function scan() {
  const sources = await loadAllData();
  /** @type {Map<string, {law:string, article:string, refs:Set<string>}>} */
  const index = new Map();

  const add = (raw, ref) => {
    const code = normalizeClause(raw);
    if (!code) return;
    const [law, article] = code.split('|');
    if (!index.has(code)) index.set(code, { law, article, refs: new Set() });
    if (ref) index.get(code).refs.add(ref);
  };

  for (const { file, data } of sources) {
    for (const item of data) {
      if (!item || !item.id) continue;
      // 考点卡：clauses[]
      if (Array.isArray(item.clauses)) {
        for (const c of item.clauses) add(c, item.id);
      }
      // 口诀卡：clauseIndex[]
      if (Array.isArray(item.clauseIndex)) {
        for (const c of item.clauseIndex) add(c, item.id);
      }
      // 案例卡：questions[].clauseIndex[]（ref 用案例卡 id）
      if (Array.isArray(item.questions)) {
        for (const q of item.questions) {
          if (q && Array.isArray(q.clauseIndex)) {
            for (const c of q.clauseIndex) add(c, item.id);
          }
        }
      }
    }
  }
  return index;
}

/* ---------- 生成文件 ---------- */

const index = await scan();

/** 法名排序 → 条号数字排序 */
const entries = [...index.entries()].sort((a, b) => {
  const [ca, va] = a;
  const [cb, vb] = b;
  if (va.law !== vb.law) return va.law.localeCompare(vb.law, 'zh');
  return Number(va.article) - Number(vb.article);
});

const HEADER = `/**
 * 【生成物】由 tools/gen-clause-index.mjs 扫描 shared/data 全部数据反向生成，勿手改。
 * 依据 2026 年公开备考资料整理，以司法部官方公告与现行有效法律法规为准。
 * 结构契约：ARCH §4.5 ClauseEntry（code '法名|条号'，refs 为关联卡片/口诀/案例 id）
 */
export default ${JSON.stringify(
    entries.map(([code, v]) => ({
      code,
      label: `《${v.law}》第${v.article}条`,
      law: v.law,
      article: v.article,
      refs: [...v.refs]
    })),
    null,
    2
  )};
`;

const OUT = join(SHARED_DATA, 'clause-index.js');
writeFileSync(OUT, HEADER, 'utf8');

// 汇总统计
let totalRefs = 0;
for (const [, v] of index) totalRefs += v.refs.size;
console.log(`[gen-clause-index] 法条条目 ${entries.length} 条，关联引用 ${totalRefs} 处 → ${OUT}`);
const byLaw = {};
for (const [, v] of index) byLaw[v.law] = (byLaw[v.law] || 0) + 1;
console.log('[gen-clause-index] 按法名分布:', byLaw);
