/**
 * 法条号归一化与反查（B-2，ARCH §4.5）
 * '刑诉法 16' / '刑事诉讼法第十六条' / '《刑事诉讼法》第16条' → code '刑事诉讼法|16'
 */
import type { ClauseEntry } from '../types/index.ts';
import { CLAUSE_INDEX } from './catalog.ts';

/** 别名 → 规范法名（覆盖数据中出现的主要法条来源） */
const LAW_ALIASES: Record<string, string> = {
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

/** 中文数字 → 阿拉伯数字（支持 一二三…十、十六、一百零八、二百七十九） */
const CN_DIGIT: Record<string, number> = {
  零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9
};

export function cnNumberToArabic(cn: string): number | null {
  if (!cn) return null;
  if (/^\d+$/.test(cn)) return parseInt(cn, 10);
  // 「十」开头的特例：十六 = 16
  let total = 0;
  let current = 0;
  for (const ch of cn) {
    if (ch === '零') continue;
    if (CN_DIGIT[ch] !== undefined) {
      current = CN_DIGIT[ch];
    } else if (ch === '十') {
      total += (current || 1) * 10;
      current = 0;
    } else if (ch === '百') {
      total += (current || 1) * 100;
      current = 0;
    } else if (ch === '千') {
      total += (current || 1) * 1000;
      current = 0;
    } else {
      return null; // 非法字符
    }
  }
  return total + current || null;
}

/** 归一化法名（未收录的返回 null） */
export function normalizeLaw(raw: string): string | null {
  const law = (raw || '').replace(/[《》\s]/g, '').replace(/中华人民共和国/g, '');
  if (!law) return null;
  if (LAW_ALIASES[law]) return LAW_ALIASES[law];
  // 兜底：包含匹配（如「刑诉法解释」）
  for (const alias of Object.keys(LAW_ALIASES)) {
    if (law.includes(alias)) return LAW_ALIASES[alias];
  }
  return null;
}

/**
 * 归一化输入为法条 code（'法名|条号'）
 * @returns 无法解析时返回 null
 */
export function normalizeClause(input: string): string | null {
  const s = (input || '').trim().replace(/[《》\s（）()]/g, '');
  if (!s) return null;
  // 形如「刑事诉讼法第16条」「刑诉法16」
  const m = s.match(/^(.+?)(?:第)?([0-9一二三四五六七八九十百零]+)条?$/);
  if (!m) {
    // 只输入法名：无条号，无法定位
    return null;
  }
  const law = normalizeLaw(m[1]);
  const article = cnNumberToArabic(m[2]);
  if (!law || article === null) return null;
  return `${law}|${article}`;
}

/** code → 展示文案（'刑事诉讼法|16' → '《刑事诉讼法》第16条'） */
export function clauseLabel(code: string): string {
  const [law, article] = code.split('|');
  if (!law || !article) return code;
  return `《${law}》第${article}条`;
}

/** code → 索引条目 */
export function lookupClause(code: string): ClauseEntry | null {
  return CLAUSE_INDEX.find((e) => e.code === code) || null;
}

/** 自然输入直达：'刑诉法 16' → 索引条目（B-2 搜索框直达） */
export function findClauseByInput(input: string): ClauseEntry | null {
  const code = normalizeClause(input);
  return code ? lookupClause(code) : null;
}

/** 从数据字符串列表中提取全部可归一化的法条 code（去重） */
export function extractCodes(clauses: string[]): string[] {
  const out: string[] = [];
  for (const c of clauses || []) {
    const code = normalizeClause(c);
    if (code && !out.includes(code)) out.push(code);
  }
  return out;
}
