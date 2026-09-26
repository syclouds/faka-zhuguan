/**
 * 【生成物】由 tools/gen-shared.mjs 生成，勿手改。
 * 在小程序 utils/constants.js 基础上追加安卓端新增键（caseRecords/drafts/disclaimerAck/searchHistory）。
 * 依据 2026 年公开备考资料整理，以司法部官方公告与现行有效法律法规为准。
 */

export const SUBJECTS = [
  {
    "id": "rule-law",
    "name": "习近平法治思想",
    "short": "法治思想",
    "color": "#E8453C",
    "icon": "论",
    "desc": "第一题论述题（约35分）"
  },
  {
    "id": "criminal",
    "name": "刑法",
    "short": "刑法",
    "color": "#2B6CF6",
    "icon": "刑",
    "desc": "案例分析必考，定罪+量刑"
  },
  {
    "id": "crim-proc",
    "name": "刑事诉讼法",
    "short": "刑诉",
    "color": "#7C4DFF",
    "icon": "诉",
    "desc": "程序纠错，证据规则"
  },
  {
    "id": "civil",
    "name": "民法",
    "short": "民法",
    "color": "#14B45F",
    "icon": "民",
    "desc": "案例分析与综合题主体"
  },
  {
    "id": "civil-proc",
    "name": "民事诉讼法",
    "short": "民诉",
    "color": "#0FA3B1",
    "icon": "民诉",
    "desc": "管辖、举证、执行异议"
  },
  {
    "id": "admin",
    "name": "行政法",
    "short": "行政",
    "color": "#FF8F1F",
    "icon": "行",
    "desc": "行政行为+复议+诉讼三阶"
  },
  {
    "id": "commercial",
    "name": "商法",
    "short": "商法",
    "color": "#B85C00",
    "icon": "商",
    "desc": "公司法、破产法为主"
  }
];

export const LEVELS = {
  "S": {
    "label": "必考",
    "color": "#E8453C"
  },
  "A": {
    "label": "高频",
    "color": "#FF8F1F"
  },
  "B": {
    "label": "常考",
    "color": "#2B6CF6"
  },
  "C": {
    "label": "了解",
    "color": "#9AA3B0"
  }
};

export const MASTERY = {
  "0": {
    "label": "未掌握",
    "tag": "tag-unknown",
    "color": "#E8453C"
  },
  "1": {
    "label": "模糊",
    "tag": "tag-fuzzy",
    "color": "#FF8F1F"
  },
  "2": {
    "label": "已掌握",
    "tag": "tag-mastered",
    "color": "#14B45F"
  }
};

/** 艾宾浩斯复习间隔（天）：掌握度越低，间隔越短（与小程序逐字一致，ARCH §9.6） */
export const REVIEW_INTERVALS = {
  "0": [
    0,
    1,
    1,
    2,
    4,
    7,
    15
  ],
  "1": [
    1,
    2,
    4,
    7,
    15,
    30
  ],
  "2": [
    3,
    7,
    15,
    30,
    60
  ]
};

/** 收藏/错题展示名 */
export const FAV_TYPES = {
  "card": "考点",
  "essay": "论述",
  "mnemonic": "口诀",
  "case": "案例"
};

/** 本地存储 key（fk_* 前缀，与小程序互通，保证备份文件兼容） */
export const STORAGE_KEYS = {
  "progress": "fk_progress",
  "settings": "fk_settings",
  "stats": "fk_stats",
  "wrongList": "fk_wrong",
  "favorites": "fk_fav",
  "examDate": "fk_exam_date",
  "cards": "fk_user_cards",
  "lastQueueDate": "fk_last_queue",
  "openid": "fk_openid",
  "caseRecords": "fk_case_records",
  "drafts": "fk_drafts",
  "disclaimerAck": "fk_disclaimer_ack",
  "searchHistory": "fk_search_history"
};

export default { SUBJECTS, LEVELS, MASTERY, REVIEW_INTERVALS, FAV_TYPES, STORAGE_KEYS };
