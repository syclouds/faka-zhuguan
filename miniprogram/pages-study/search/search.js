// pages-study/search/search.js — 全文检索考点 + 论述模板
const db = require('../../data/index');

const HOT_WORDS = ['正当防卫', '非法证据排除', '善意取得', '表见代理', '一事不再罚', '人格否认', '举证责任', '量刑', '复议'];

Page({
  data: {
    keyword: '',
    cards: [],
    essays: [],
    searched: false,
    hotWords: HOT_WORDS,
    history: []
  },

  onLoad() {
    const history = wx.getStorageSync('fk_search_history') || [];
    this.setData({ history });
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
    if (!e.detail.value) this.setData({ cards: [], essays: [], searched: false });
  },

  onConfirm() {
    this.doSearch(this.data.keyword);
  },

  onHotTap(e) {
    const kw = e.currentTarget.dataset.kw;
    this.setData({ keyword: kw });
    this.doSearch(kw);
  },

  doSearch(kw) {
    const keyword = (kw || '').trim();
    if (!keyword) return;
    const cards = db.searchCards(keyword);
    const essays = db.getEssays().filter((e) => {
      const text = [e.title, e.topic, e.sample].concat(e.phrases).join(' ');
      return text.indexOf(keyword) > -1;
    });
    this.setData({ cards, essays, searched: true });

    // 记录搜索历史（最多 10 条，去重）
    let history = (wx.getStorageSync('fk_search_history') || []).filter((h) => h !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 10);
    wx.setStorageSync('fk_search_history', history);
    this.setData({ history });
  },

  onHistoryTap(e) {
    const kw = e.currentTarget.dataset.kw;
    this.setData({ keyword: kw });
    this.doSearch(kw);
  },

  onClearHistory() {
    wx.removeStorageSync('fk_search_history');
    this.setData({ history: [] });
  },

  onCardTap(e) {
    wx.navigateTo({ url: `/pages-study/recite/recite?cardId=${e.currentTarget.dataset.id}` });
  },

  onEssayTap(e) {
    wx.navigateTo({ url: `/pages-study/essay-detail/essay-detail?id=${e.currentTarget.dataset.id}` });
  }
});
