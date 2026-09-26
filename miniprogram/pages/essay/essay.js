// pages/essay/essay.js — 论述题模板列表
const db = require('../../data/index');
const review = require('../../utils/review');
const { LEVELS } = require('../../utils/constants');

Page({
  data: {
    topics: [],
    activeTopic: '全部',
    list: [],
    levelMap: LEVELS
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const all = db.getEssays();
    const topics = ['全部'].concat(db.ESSAY_TOPICS);
    const favs = review.getFavorites().filter((f) => f.type === 'essay').map((f) => f.id);
    const list = (this.data.activeTopic === '全部' ? all : all.filter((e) => e.topic === this.data.activeTopic)).map(
      (e) => Object.assign({}, e, { fav: favs.indexOf(e.id) > -1 })
    );
    this.setData({ topics, list });
  },

  onTopicChange(e) {
    this.setData({ activeTopic: e.currentTarget.dataset.topic }, () => this.refresh());
  },

  onDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/essay-detail/essay-detail?id=${id}` });
  },

  /** 快速背诵：进入卡片式背诵模式 */
  onRecite(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/essay-detail/essay-detail?id=${id}&mode=recite` });
  },

  onShareAppMessage() {
    return { title: '法考主观题 · 论述题万能模板', path: '/pages/essay/essay' };
  }
});
