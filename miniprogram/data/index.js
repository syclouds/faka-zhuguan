/**
 * 数据聚合层 — 全站唯一数据入口
 * 页面不直接 require 各科目文件，统一从这里取
 */
const { SUBJECTS } = require('../utils/constants');

const RAW = {
  'rule-law': require('./study-rule-law'),
  criminal: require('./study-criminal'),
  'crim-proc': require('./study-crim-proc'),
  civil: require('./study-civil'),
  'civil-proc': require('./study-civil-proc'),
  admin: require('./study-admin'),
  commercial: require('./study-commercial')
};

const ESSAY_TEMPLATES = require('./essay-templates');

/** 全量卡片（含 subjectId / subjectName 冗余字段，方便列表渲染） */
const ALL_CARDS = [];
SUBJECTS.forEach((s) => {
  (RAW[s.id] || []).forEach((c) => {
    ALL_CARDS.push(
      Object.assign({}, c, {
        subjectId: s.id,
        subjectName: s.name,
        subjectShort: s.short,
        subjectColor: s.color
      })
    );
  });
});

/** 全部章节（按科目分组） */
function getSubjectsWithChapters() {
  return SUBJECTS.map((s) => {
    const cards = ALL_CARDS.filter((c) => c.subjectId === s.id);
    const chapterMap = {};
    cards.forEach((c) => {
      if (!chapterMap[c.chapter]) chapterMap[c.chapter] = { name: c.chapter, count: 0, sCount: 0, ids: [] };
      chapterMap[c.chapter].count += 1;
      if (c.level === 'S') chapterMap[c.chapter].sCount += 1;
      chapterMap[c.chapter].ids.push(c.id);
    });
    return Object.assign({}, s, {
      total: cards.length,
      chapters: Object.values(chapterMap),
      cards
    });
  });
}

function getSubject(subjectId) {
  return SUBJECTS.find((s) => s.id === subjectId) || null;
}

function getCardsBySubject(subjectId) {
  return ALL_CARDS.filter((c) => c.subjectId === subjectId);
}

function getCardsByChapter(chapterName, subjectId) {
  return ALL_CARDS.filter((c) => c.chapter === chapterName && (!subjectId || c.subjectId === subjectId));
}

function getCardsByChapterId(subjectId, chapterIndex) {
  const cards = getCardsBySubject(subjectId);
  const chapterMap = {};
  cards.forEach((c) => {
    if (!chapterMap[c.chapter]) chapterMap[c.chapter] = [];
    chapterMap[c.chapter].push(c);
  });
  const keys = Object.keys(chapterMap);
  const key = keys[Number(chapterIndex)];
  return key ? { chapter: key, cards: chapterMap[key] } : { chapter: '', cards: [] };
}

function getCardById(id) {
  return ALL_CARDS.find((c) => c.id === id) || null;
}

function getCardsByIds(ids) {
  const set = new Set(ids);
  return ALL_CARDS.filter((c) => set.has(c.id));
}

/** 论述模板 */
function getEssays() {
  return ESSAY_TEMPLATES;
}

function getEssayById(id) {
  return ESSAY_TEMPLATES.find((e) => e.id === id) || null;
}

function getEssaysByTopic(topic) {
  return ESSAY_TEMPLATES.filter((e) => e.topic === topic);
}

const ESSAY_TOPICS = Array.from(new Set(ESSAY_TEMPLATES.map((e) => e.topic)));

/** 关键词全文检索（标题 / 采分点 / 法条） */
function searchCards(keyword) {
  const kw = (keyword || '').trim();
  if (!kw) return [];
  const lower = kw.toLowerCase();
  const hit = (c) => {
    if (c.title.toLowerCase().indexOf(lower) > -1) return true;
    if (c.chapter.toLowerCase().indexOf(lower) > -1) return true;
    if ((c.core || '').toLowerCase().indexOf(lower) > -1) return true;
    if ((c.points || []).some((p) => (p.k + p.v).toLowerCase().indexOf(lower) > -1)) return true;
    if ((c.clauses || []).some((s) => s.toLowerCase().indexOf(lower) > -1)) return true;
    return false;
  };
  return ALL_CARDS.filter(hit).slice(0, 60);
}

/** 统计信息 */
function getStats() {
  const bySubject = {};
  SUBJECTS.forEach((s) => {
    bySubject[s.id] = ALL_CARDS.filter((c) => c.subjectId === s.id).length;
  });
  return {
    totalCards: ALL_CARDS.length,
    totalSubjects: SUBJECTS.length,
    totalEssay: ESSAY_TEMPLATES.length,
    totalSLevel: ALL_CARDS.filter((c) => c.level === 'S').length,
    bySubject
  };
}

module.exports = {
  SUBJECTS,
  ALL_CARDS,
  getSubjectsWithChapters,
  getSubject,
  getCardsBySubject,
  getCardsByChapter,
  getCardsByChapterId,
  getCardById,
  getCardsByIds,
  getEssays,
  getEssayById,
  getEssaysByTopic,
  ESSAY_TOPICS,
  searchCards,
  getStats
};
