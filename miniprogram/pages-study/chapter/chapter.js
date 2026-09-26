// pages-study/chapter/chapter.js — 某科目下的章节列表
const db = require('../../data/index');
const review = require('../../utils/review');
const { MASTERY } = require('../../utils/constants');

Page({
  data: {
    subject: null,
    chapters: [],
    total: 0,
    mastered: 0,
    percent: 0
  },

  onLoad(options) {
    const subjectId = options.subjectId;
    const subject = db.getSubject(subjectId);
    if (!subject) {
      wx.showToast({ title: '科目不存在', icon: 'none' });
      return setTimeout(() => wx.navigateBack(), 800);
    }
    wx.setNavigationBarTitle({ title: subject.name });
    this.subjectId = subjectId;
    this.refresh();
  },

  onShow() {
    if (this.subjectId) this.refresh();
  },

  refresh() {
    const withCh = db.getSubjectsWithChapters().find((s) => s.id === this.subjectId);
    const cards = withCh.cards;
    const levelMap = review.levelStats(cards);
    const progress = review.readProgress();

    const chapters = withCh.chapters.map((ch, ci) => {
      const chCards = db.getCardsByChapterId(this.subjectId, ci).cards;
      const done = chCards.filter((c) => progress[c.id] && progress[c.id].level === 2).length;
      const learned = chCards.filter((c) => progress[c.id]).length;
      return Object.assign({}, ch, {
        index: ci,
        done,
        learned,
        percent: chCards.length ? Math.round((done / chCards.length) * 100) : 0
      });
    });

    const mastered = levelMap[2] || 0;
    this.setData({
      subject: withCh,
      chapters,
      total: cards.length,
      mastered,
      percent: cards.length ? Math.round((mastered / cards.length) * 100) : 0,
      masteryLabel: MASTERY[2].label
    });
  },

  onChapterTap(e) {
    const index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages-study/recite/recite?subjectId=${this.subjectId}&chapterIndex=${index}`
    });
  },

  /** 按重要度筛选后开始背诵 */
  onFilterLevel(e) {
    const level = e.currentTarget.dataset.level;
    const cards = db.getCardsBySubject(this.subjectId).filter((c) => c.level === level);
    if (!cards.length) return wx.showToast({ title: '该重要度下暂无考点', icon: 'none' });
    wx.setStorageSync('fk_temp_cards', cards.map((c) => c.id));
    wx.navigateTo({ url: `/pages-study/recite/recite?subjectId=${this.subjectId}&level=${level}` });
  },

  /** 全科目顺序背诵 */
  onStartAll() {
    wx.navigateTo({ url: `/pages-study/recite/recite?subjectId=${this.subjectId}` });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.subject ? this.data.subject.name : ''}考点｜法考主观题速记`,
      path: `/pages-study/chapter/chapter?subjectId=${this.subjectId}`
    };
  }
});
