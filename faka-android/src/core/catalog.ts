/**
 * 数据装配层（ARCH §4.1）：shared/data → 运行期归一化为统一 ReviewItem。
 * 考点卡源数据零改动，只注入 kind/subject 等冗余字段；口诀/案例按原生结构加载。
 */
import { SUBJECTS } from '../../../shared/constants.js';
import studyRuleLaw from '../../../shared/data/study-rule-law.js';
import studyCriminal from '../../../shared/data/study-criminal.js';
import studyCrimProc from '../../../shared/data/study-crim-proc.js';
import studyCivil from '../../../shared/data/study-civil.js';
import studyCivilProc from '../../../shared/data/study-civil-proc.js';
import studyAdmin from '../../../shared/data/study-admin.js';
import studyCommercial from '../../../shared/data/study-commercial.js';
import essayTemplates from '../../../shared/data/essay-templates.js';
import mnemonicsRaw from '../../../shared/data/mnemonics-crim-proc.js';
import casesCivilRaw from '../../../shared/data/cases-civil.js';
import casesCrimProcRaw from '../../../shared/data/cases-crim-proc.js';
import casesRuleLawRaw from '../../../shared/data/cases-rule-law.js';
import questionTypesRaw from '../../../shared/data/question-types.js';
import clauseIndexRaw from '../../../shared/data/clause-index.js';
import type {
  CardItem,
  CaseCard,
  CaseQuestion,
  ClauseEntry,
  EssayTemplate,
  LegacyCard,
  Level,
  MnemonicCard,
  Point,
  QuestionTypeEntry,
  ReviewItem,
  SubjectMeta
} from '../types/index.ts';
import { getUserCards } from './review.ts';

/* ---------- 考点卡装配（注入 kind/subject 元数据） ---------- */

const RAW_BY_SUBJECT: Record<string, LegacyCard[]> = {
  'rule-law': studyRuleLaw as LegacyCard[],
  criminal: studyCriminal as LegacyCard[],
  'crim-proc': studyCrimProc as LegacyCard[],
  civil: studyCivil as LegacyCard[],
  'civil-proc': studyCivilProc as LegacyCard[],
  admin: studyAdmin as LegacyCard[],
  commercial: studyCommercial as LegacyCard[]
};

function subjectMeta(id: string): SubjectMeta {
  return (
    SUBJECTS.find((s) => s.id === id) || {
      id,
      name: id,
      short: id,
      color: '#9AA3B0',
      icon: '?',
      desc: ''
    }
  );
}

export const ALL_CARDS: CardItem[] = SUBJECTS.flatMap((s) =>
  ((RAW_BY_SUBJECT[s.id] || []) as LegacyCard[]).map((c) => ({
    ...c,
    kind: 'card' as const,
    subject: s.id,
    subjectName: s.name,
    subjectShort: s.short,
    subjectColor: s.color
  }))
);

/* ---------- 口诀 / 案例 / 模板 / 索引（T03 内容批次填充） ---------- */

export const MNEMONICS: MnemonicCard[] = (mnemonicsRaw as MnemonicCard[]) || [];
export const CASES: CaseCard[] = [
  ...((casesCivilRaw as CaseCard[]) || []),
  ...((casesCrimProcRaw as CaseCard[]) || []),
  ...((casesRuleLawRaw as CaseCard[]) || [])
];
export const ESSAYS: EssayTemplate[] = (essayTemplates as EssayTemplate[]) || [];
export const QUESTION_TYPES: QuestionTypeEntry[] = (questionTypesRaw as QuestionTypeEntry[]) || [];
export const CLAUSE_INDEX: ClauseEntry[] = (clauseIndexRaw as ClauseEntry[]) || [];

export const ESSAY_TOPICS: string[] = Array.from(new Set(ESSAYS.map((e) => e.topic)));

/* ---------- 章节分组 ---------- */

export interface ChapterGroup {
  name: string;
  count: number;
  sCount: number;
  ids: string[];
}

export interface SubjectGroup extends SubjectMeta {
  total: number;
  chapters: ChapterGroup[];
  cards: CardItem[];
}

export function getSubjectsWithChapters(): SubjectGroup[] {
  return SUBJECTS.map((s) => {
    const cards = ALL_CARDS.filter((c) => c.subject === s.id);
    const chapterMap: Record<string, ChapterGroup> = {};
    cards.forEach((c) => {
      if (!chapterMap[c.chapter]) chapterMap[c.chapter] = { name: c.chapter, count: 0, sCount: 0, ids: [] };
      chapterMap[c.chapter].count += 1;
      if (c.level === 'S') chapterMap[c.chapter].sCount += 1;
      chapterMap[c.chapter].ids.push(c.id);
    });
    return { ...s, total: cards.length, chapters: Object.values(chapterMap), cards };
  });
}

export function getSubject(id: string): SubjectMeta | null {
  return SUBJECTS.find((s) => s.id === id) || null;
}

export function getCardsBySubject(subjectId: string): CardItem[] {
  return ALL_CARDS.filter((c) => c.subject === subjectId);
}

/** subjectId 下第 chapterIndex 个章节的卡片（章节顺序 = 首次出现顺序，与小程序一致） */
export function getCardsByChapterId(subjectId: string, chapterIndex: number): { chapter: string; cards: CardItem[] } {
  const cards = getCardsBySubject(subjectId);
  const chapterMap: Record<string, CardItem[]> = {};
  cards.forEach((c) => {
    if (!chapterMap[c.chapter]) chapterMap[c.chapter] = [];
    chapterMap[c.chapter].push(c);
  });
  const keys = Object.keys(chapterMap);
  const key = keys[chapterIndex];
  return key ? { chapter: key, cards: chapterMap[key] } : { chapter: '', cards: [] };
}

export function getCardById(id: string): CardItem | null {
  return ALL_CARDS.find((c) => c.id === id) || null;
}

export function getCardsByIds(ids: string[]): CardItem[] {
  const set = new Set(ids);
  return ALL_CARDS.filter((c) => set.has(c.id));
}

/* ---------- 口诀 / 案例查询 ---------- */

export function getMnemonicsBySubject(subjectId: string): MnemonicCard[] {
  return MNEMONICS.filter((m) => m.subject === subjectId);
}

export function getMnemonicById(id: string): MnemonicCard | null {
  return MNEMONICS.find((m) => m.id === id) || null;
}

export function getCasesBySubject(subjectId: string): CaseCard[] {
  return CASES.filter((c) => c.subject === subjectId);
}

export function getCaseById(id: string): CaseCard | null {
  return CASES.find((c) => c.id === id) || null;
}

export function getEssayById(id: string): EssayTemplate | null {
  return ESSAYS.find((e) => e.id === id) || null;
}

export function getQuestionType(id: string): QuestionTypeEntry | null {
  return QUESTION_TYPES.find((t) => t.id === id) || null;
}

/* ---------- 统一 ReviewItem（队列/列表渲染用） ---------- */

/** 考点卡 → ReviewItem */
export function cardToItem(c: CardItem): ReviewItem {
  return {
    id: c.id,
    kind: 'card',
    subject: c.subject,
    chapter: c.chapter,
    level: c.level,
    primary: c.title,
    secondary: c.core,
    points: c.points,
    clauses: c.clauses || []
  };
}

/** 口诀卡 → ReviewItem */
export function mnemonicToItem(m: MnemonicCard): ReviewItem {
  return {
    id: m.id,
    kind: 'mnemonic',
    subject: m.subject,
    chapter: m.chapter,
    level: m.level,
    primary: m.mnemonic,
    secondary: m.scenario,
    points: m.points,
    clauses: m.clauseIndex || []
  };
}

/** id → ReviewItem（仅支持 card / mnemonic；案例走 CaseDetail 自评，不进背诵队列） */
export function resolveReviewItem(id: string): ReviewItem | null {
  const card = getCardById(id);
  if (card) return cardToItem(card);
  const mn = getMnemonicById(id);
  if (mn) return mnemonicToItem(mn);
  const user = getUserCardById(id);
  if (user) return cardToItem(user as CardItem);
  return null;
}

function getUserCardById(id: string): LegacyCard | null {
  return (getUserCards() as LegacyCard[]).find((c) => c.id === id) || null;
}

/** 全量可背诵项（考点 + 口诀；自建考点由页面层合并） */
export function allRecitableItems(): ReviewItem[] {
  return ALL_CARDS.map(cardToItem).concat(MNEMONICS.map(mnemonicToItem));
}

/** 自建考点 → ReviewItem（subject 用 'user'，展示时以 title/core 为主） */
export function userCardsToItems(): ReviewItem[] {
  return (getUserCards() as LegacyCard[]).map((c) => ({
    id: c.id,
    kind: 'card' as const,
    subject: 'user',
    chapter: c.chapter,
    level: c.level,
    primary: c.title,
    secondary: c.core,
    points: c.points,
    clauses: c.clauses || []
  }));
}

/** 数据统计（对账用） */
export function getCatalogStats(): {
  totalCards: number;
  totalSubjects: number;
  totalEssay: number;
  totalSLevel: number;
  totalMnemonics: number;
  totalCases: number;
  totalQuestions: number;
  bySubject: Record<string, number>;
} {
  const bySubject: Record<string, number> = {};
  SUBJECTS.forEach((s) => {
    bySubject[s.id] = ALL_CARDS.filter((c) => c.subject === s.id).length;
  });
  return {
    totalCards: ALL_CARDS.length,
    totalSubjects: SUBJECTS.length,
    totalEssay: ESSAYS.length,
    totalSLevel: ALL_CARDS.filter((c) => c.level === 'S').length,
    totalMnemonics: MNEMONICS.length,
    totalCases: CASES.length,
    totalQuestions: CASES.reduce((acc, c) => acc + c.questions.length, 0),
    bySubject
  };
}

/** 采分点类型辅助（供 Recite 空态构建） */
export function pointsOf(item: ReviewItem): Point[] {
  return item.points || [];
}

/** 案例设问 qType 兜底 */
export function qTypeOf(q: CaseQuestion): string {
  return q.qType || 'open';
}

export type { Level };
