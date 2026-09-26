/**
 * ★ 全局数据契约（ARCH §4）
 * shared/data/* 的 JSDoc 与此对齐；core/* 与页面层共用。
 */

/* ================= 基础枚举 ================= */

/** 卡片种类：考点(原有 88 张) / 口诀(B-1) / 案例(B-3) */
export type CardKind = 'card' | 'mnemonic' | 'case';

/** 采分点（默写挖空的是 k，展开说明是 v） */
export interface Point {
  k: string;
  v: string;
}

/** 重要度 */
export type Level = 'S' | 'A' | 'B' | 'C';

/** 掌握度：-1 未学 / 0 没记住 / 1 模糊 / 2 记住了 */
export type MasteryLevel = -1 | 0 | 1 | 2;

/** 科目元信息（shared/constants.js SUBJECTS） */
export interface SubjectMeta {
  id: string;
  name: string;
  short: string;
  color: string;
  icon: string;
  desc: string;
}

/* ================= 三种卡片 ================= */

/** 小程序原有考点卡结构（源文件不动，shared/data/study-*.js） */
export interface LegacyCard {
  id: string;
  chapter: string;
  title: string;
  level: Level;
  core: string;
  points: Point[];
  clauses: string[];
  trick: string;
  essay?: boolean;
}

/** 装配后的考点卡（新增字段，原字段原样保留） */
export interface CardItem extends LegacyCard {
  kind: 'card';
  subject: string;
  subjectName: string;
  subjectShort: string;
  subjectColor: string;
}

/**
 * 口诀卡（B-1）
 * U-2 裁决：clauseIndex 用 string[]（一条口诀常引多条规定）。
 */
export interface MnemonicCard {
  id: string;
  kind: 'mnemonic';
  subject: string;
  chapter: string;
  /** 口诀短句（卡片正面大字） */
  mnemonic: string;
  /** 适用情形标题（副标题） */
  scenario: string;
  /** 展开：每条情形 {k: 情形关键词, v: 展开表述} */
  points: Point[];
  /** 法条号数组，可点 → 法条速查（B-2） */
  clauseIndex: string[];
  level: Level;
  /** 易错提示（可选） */
  tip?: string;
  /** 合规标注（可选，默认走全局免责声明常量） */
  sourceNote?: string;
}

/** 六类设问（B-4） */
export type QuestionType = 'relief' | 'plan' | 'evaluate' | 'correct' | 'essay' | 'open';

/** 一个采分点（案例自评粒度，U-4） */
export interface ScorePoint {
  id: string;
  /** 采分关键词（自评按钮旁展示） */
  k: string;
  /** 展开表述（可选） */
  v?: string;
}

/** 一道设问（U-3 裁决：案例卡补 title、设问补 qType） */
export interface CaseQuestion {
  /** 'case-civ-001-q1'，全局唯一 */
  qid: string;
  /** 设问原文（自有表述） */
  q: string;
  /** 关联 B-4，支持「怎么答？」跳转并高亮 */
  qType?: QuestionType;
  /** 参考答案（自有表述） */
  answer: string;
  /** ≥1 条 */
  scorePoints: ScorePoint[];
  /** 本问涉及的法条号（可点） */
  clauseIndex?: string[];
}

/** 案例卡（B-3） */
export interface CaseCard {
  id: string;
  kind: 'case';
  subject: string;
  chapter: string;
  /** 列表页标题（如"案例1·房屋租赁"） */
  title: string;
  level: Level;
  /** 案情长文本 */
  prompt: string;
  /** ≥1 问 */
  questions: CaseQuestion[];
}

/** 案例训练记录（持久化） */
export interface CaseRecord {
  caseId: string;
  /** 做过几轮 */
  attempts: number;
  /** 最近一次时间戳 */
  lastAt: number;
  /** 命中的 ScorePoint 复合 id（caseId#qid#spId） */
  hit: string[];
  /** 未答到（回流错题本） */
  miss: string[];
  /** 最近一次踩中率 0–1 */
  rate: number;
}

/* ================= 论述模板 / 法条索引 / 设问模板 ================= */

/** 论述模板（shared/data/essay-templates.js） */
export interface EssayTemplate {
  id: string;
  topic: string;
  title: string;
  level: Level;
  frame: Point[];
  phrases: string[];
  fill: string[];
  sample: string;
  trap: string;
}

/** 法条索引条目（B-2） */
export interface ClauseEntry {
  /** 归一化键：'刑事诉讼法|16'（core/clause.ts normalize） */
  code: string;
  /** 展示：'《刑事诉讼法》第16条' */
  label: string;
  law: string;
  article: string;
  /** 关联的卡片/口诀/案例 id（双向跳转的反查来源） */
  refs: string[];
}

/** 六类设问模板条目（B-4） */
export interface QuestionTypeEntry {
  id: QuestionType;
  name: string;
  /** 识别特征 */
  signal: string;
  /** 示例设问 */
  example: string;
  /** 标准答法结构（逐条） */
  structure: string[];
  /** 常见失分提示 */
  trap: string;
}

/* ================= 统一复习项（队列/列表渲染用） ================= */

/**
 * 复习项：进度/错题/收藏/队列统一按 id 索引。
 * primary：考点=title，口诀=mnemonic，案例=title
 * secondary：考点=core，口诀=scenario，案例=prompt 摘要
 * points：考点/口诀=采分点；案例=null（案例用 questions 自评）
 */
export interface ReviewItem {
  id: string;
  kind: CardKind;
  subject: string;
  chapter: string;
  level: Level;
  primary: string;
  secondary: string;
  points: Point[] | null;
  clauses: string[];
}

/* ================= 存储层 ================= */

/** 单卡进度：与小程序完全一致 */
export interface ProgressRecord {
  level: MasteryLevel;
  /** 间隔数组下标 */
  stage: number;
  /** 下次到期时间戳（本地当天 00:00） */
  due: number;
  lastAt: number;
  wrong: number;
  seen: number;
}
/** key = 卡片 id（全局唯一，不额外存 kind） */
export type ProgressMap = Record<string, ProgressRecord>;

export interface Settings {
  /** 每日新学上限，默认 20 */
  dailyNew: number;
  /** 每日复习上限，默认 60 */
  dailyReview: number;
  /** 默写关键词提示开关 */
  showKeywordTip: boolean;
  /** 考试日期时间戳，0 = 未设置（首页提示设置；以司法部官方公告为准） */
  examDate: number;
  /** 深色模式（A-10） */
  theme: 'system' | 'light' | 'dark';
  /** 字体缩放 0.9–1.3，默认 1 */
  fontScale: number;
  /** C-5 每日提醒开关，默认 false */
  remind: boolean;
  /** 'HH:mm'，默认 '21:00' */
  remindAt: string;
}

/** 设置默认值（review.getSettings / backup 导入合并 / useAppStore 初始态共用） */
export const DEFAULT_SETTINGS: Settings = {
  dailyNew: 20,
  dailyReview: 60,
  showKeywordTip: true,
  examDate: 0,
  theme: 'system',
  fontScale: 1,
  remind: false,
  remindAt: '21:00'
};

export interface StatDay {
  /** new Date().toDateString() */
  date: string;
  count: number;
}

export interface Stats {
  days: StatDay[];
  totalCards: number;
  /** 连续打卡天数 */
  streak: number;
}

export type FavKind = 'card' | 'mnemonic' | 'case' | 'essay';

export interface Favorite {
  id: string;
  kind: FavKind;
  title: string;
  at: number;
}

/**
 * 错题本条目（string 编码，兼容小程序已有数据）：
 *   'crimpro-02'             → 考点卡
 *   'mn-crimpro-003'         → 口诀卡
 *   'case-civ-001#q1#sp-2'   → 案例某问的某个采分点（U-4 单采分点粒度）
 */
export type WrongRef = string;

/** 用户自建考点 */
export interface UserCard extends LegacyCard {
  source: 'user';
  createdAt: number;
}

/** 草稿（案例设问/论述练习自动保存），key = qid 或 essay-<id> */
export type DraftMap = Record<string, { text: string; updatedAt: number }>;

/** 默写空状态（Recite 页 blanks[]） */
export interface BlankState {
  k: string;
  input: string;
  checked: boolean;
  right: boolean;
}

/* ================= 备份（C-2 导出/导入） ================= */

export interface BackupFile {
  /** ★ 版本闸门：不等于 1 时给出明确报错而非崩溃 */
  schema: 1;
  app: string;
  version: string;
  exportedAt: number;
  data: {
    progress: ProgressMap;
    settings: Settings;
    stats: Stats;
    wrongList: WrongRef[];
    favorites: Favorite[];
    userCards: UserCard[];
    caseRecords: Record<string, CaseRecord>;
    drafts: DraftMap;
  };
}

/* ================= 合规与版本常量（ARCH §9.7） ================= */

export const DISCLAIMER =
  '本应用内容依据 2026 年公开备考资料与现行有效法律法规整理，仅供备考参考，非官方发布。考试日期、科目分值、报名政策等均以司法部官方公告为准。';

export const APP_VERSION = '1.0.0';
