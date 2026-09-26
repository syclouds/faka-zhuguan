/**
 * 数据字典 / 常量
 * 维护说明：新增科目只需在此追加，并在 data/index.js 中注册
 */

/** 科目 */
const SUBJECTS = [
  { id: 'rule-law', name: '习近平法治思想', short: '法治思想', color: '#E8453C', icon: '论', desc: '第一题论述题（约35分）' },
  { id: 'criminal', name: '刑法', short: '刑法', color: '#2B6CF6', icon: '刑', desc: '案例分析必考，定罪+量刑' },
  { id: 'crim-proc', name: '刑事诉讼法', short: '刑诉', color: '#7C4DFF', icon: '诉', desc: '程序纠错，证据规则' },
  { id: 'civil', name: '民法', short: '民法', color: '#14B45F', icon: '民', desc: '案例分析与综合题主体' },
  { id: 'civil-proc', name: '民事诉讼法', short: '民诉', color: '#0FA3B1', icon: '民诉', desc: '管辖、举证、执行异议' },
  { id: 'admin', name: '行政法', short: '行政', color: '#FF8F1F', icon: '行', desc: '行政行为+复议+诉讼三阶' },
  { id: 'commercial', name: '商法', short: '商法', color: '#B85C00', icon: '商', desc: '公司法、破产法为主' }
];

/** 重要度 */
const LEVELS = {
  S: { label: '必考', color: '#E8453C' },
  A: { label: '高频', color: '#FF8F1F' },
  B: { label: '常考', color: '#2B6CF6' },
  C: { label: '了解', color: '#9AA3B0' }
};

/** 掌握度 */
const MASTERY = {
  0: { label: '未掌握', tag: 'tag-unknown', color: '#E8453C' },
  1: { label: '模糊', tag: 'tag-fuzzy', color: '#FF8F1F' },
  2: { label: '已掌握', tag: 'tag-mastered', color: '#14B45F' }
};

/** 艾宾浩斯复习间隔（天）：掌握度越低，间隔越短 */
const REVIEW_INTERVALS = {
  0: [0, 1, 1, 2, 4, 7, 15],       // 未掌握
  1: [1, 2, 4, 7, 15, 30],        // 模糊
  2: [3, 7, 15, 30, 60]           // 已掌握
};

/** 收藏类型 */
const FAV_TYPES = {
  card: '考点',
  essay: '论述'
};

/** 本地存储 key */
const STORAGE_KEYS = {
  progress: 'fk_progress',          // { [cardId]: { level, stage, due, lastAt, wrong } }
  settings: 'fk_settings',
  stats: 'fk_stats',
  wrongList: 'fk_wrong',
  favorites: 'fk_fav',              // [{ id, type: 'card'|'essay', at }]
  examDate: 'fk_exam_date',         // 考试日期时间戳
  cards: 'fk_user_cards',           // 用户自建卡片
  lastQueueDate: 'fk_last_queue',
  openid: 'fk_openid'
};

module.exports = {
  SUBJECTS,
  LEVELS,
  MASTERY,
  REVIEW_INTERVALS,
  FAV_TYPES,
  STORAGE_KEYS
};
