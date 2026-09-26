/**
 * 五类分组检索 + 法条号直达 + 搜索历史（P9，ARCH §3.2）
 * 分组：考点 / 口诀 / 案例 / 论述模板 / 法条号。
 */
import type { CardItem, CaseCard, ClauseEntry, EssayTemplate, MnemonicCard } from '../types/index.ts';
import { get, set } from './store.ts';
import { ALL_CARDS, CASES, CLAUSE_INDEX, ESSAYS, MNEMONICS } from './catalog.ts';
import { findClauseByInput, clauseLabel, normalizeClause } from './clause.ts';

export interface SearchResults {
  kw: string;
  cards: CardItem[];
  mnemonics: MnemonicCard[];
  cases: CaseCard[];
  essays: EssayTemplate[];
  clauses: ClauseEntry[];
  /** 法条号直达命中（'刑诉法 16'） */
  clauseDirect: ClauseEntry | null;
}

const LIMIT = 60;
const HISTORY_KEY = 'searchHistory';
const HISTORY_MAX = 10;

function hitText(haystacks: (string | undefined)[], lower: string): boolean {
  return haystacks.some((h) => (h || '').toLowerCase().includes(lower));
}

function hitPoints(points: { k: string; v?: string }[] | null | undefined, lower: string): boolean {
  return (points || []).some((p) => `${p.k}${p.v || ''}`.toLowerCase().includes(lower));
}

function hitClauses(clauses: string[] | undefined, lower: string): boolean {
  return (clauses || []).some((s) => (s || '').toLowerCase().includes(lower));
}

/** 考点卡检索（与小程序 data/index.js searchCards 命中面一致：标题/章节/核心/采分点/法条） */
export function searchCards(keyword: string): CardItem[] {
  const kw = (keyword || '').trim();
  if (!kw) return [];
  const lower = kw.toLowerCase();
  return ALL_CARDS.filter(
    (c) =>
      hitText([c.title, c.chapter, c.core], lower) ||
      hitPoints(c.points, lower) ||
      hitClauses(c.clauses, lower)
  ).slice(0, LIMIT);
}

export function searchMnemonics(keyword: string): MnemonicCard[] {
  const lower = (keyword || '').trim().toLowerCase();
  if (!lower) return [];
  return MNEMONICS.filter(
    (m) =>
      hitText([m.mnemonic, m.scenario, m.chapter, m.tip], lower) ||
      hitPoints(m.points, lower) ||
      hitClauses(m.clauseIndex, lower)
  ).slice(0, LIMIT);
}

export function searchCases(keyword: string): CaseCard[] {
  const lower = (keyword || '').trim().toLowerCase();
  if (!lower) return [];
  return CASES.filter(
    (c) =>
      hitText([c.title, c.chapter, c.prompt], lower) ||
      hitClauses(c.questions.flatMap((q) => q.clauseIndex || []), lower) ||
      c.questions.some((q) => hitText([q.q, q.answer], lower) || hitPoints(q.scorePoints, lower))
  ).slice(0, LIMIT);
}

export function searchEssays(keyword: string): EssayTemplate[] {
  const lower = (keyword || '').trim().toLowerCase();
  if (!lower) return [];
  return ESSAYS.filter(
    (e) =>
      hitText([e.title, e.topic, e.sample, e.trap], lower) ||
      hitPoints(e.frame, lower) ||
      e.phrases.some((p) => p.toLowerCase().includes(lower))
  ).slice(0, LIMIT);
}

/** 法条检索：直达优先（'刑诉法 16'），再按 label 模糊匹配 */
export function searchClauses(keyword: string): { direct: ClauseEntry | null; list: ClauseEntry[] } {
  const kw = (keyword || '').trim();
  if (!kw) return { direct: null, list: [] };
  const direct = findClauseByInput(kw);
  const code = normalizeClause(kw);
  const lower = kw.toLowerCase();
  const list = CLAUSE_INDEX.filter(
    (e) => e.code !== code && (clauseLabel(e.code).toLowerCase().includes(lower) || e.law.toLowerCase().includes(lower))
  ).slice(0, LIMIT);
  return { direct, list };
}

export function searchAll(keyword: string): SearchResults {
  const kw = (keyword || '').trim();
  const clauseRes = searchClauses(kw);
  return {
    kw,
    cards: searchCards(kw),
    mnemonics: searchMnemonics(kw),
    cases: searchCases(kw),
    essays: searchEssays(kw),
    clauses: clauseRes.list,
    clauseDirect: clauseRes.direct
  };
}

/* ---------- 搜索历史（最多 10 条，新的在前） ---------- */

export function getSearchHistory(): string[] {
  return get<string[]>(HISTORY_KEY, []) || [];
}

export function addSearchHistory(kw: string): string[] {
  const v = (kw || '').trim();
  if (!v) return getSearchHistory();
  const list = getSearchHistory().filter((h) => h !== v);
  list.unshift(v);
  const trimmed = list.slice(0, HISTORY_MAX);
  set(HISTORY_KEY, trimmed);
  return trimmed;
}

export function clearSearchHistory(): void {
  set(HISTORY_KEY, []);
}
