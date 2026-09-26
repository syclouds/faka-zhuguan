// pages/review/review.js — 背诵页：今日队列 / 错题 / 收藏 / 全部
const db = require('../../data/index');
const review = require('../../utils/review');
const store = require('../../utils/store');

const TABS = [
  { key: 'today', name: '今日' },
  { key: 'wrong', name: '错题' },
  { key: 'fav', name: '收藏' },
  { key: 'all', name: '全部' }
];

Page({
  data: {
    tabs: TABS,
    activeTab: 'today',
    list: [],
    grouped: [],
    summary: { review: 0, fresh: 0, wrong: 0, fav: 0, mastered: 0, total: 0 },
    settings: null
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key }, () => this.refresh());
  },

  refresh() {
    const cards = db.ALL_CARDS;
    const settings = review.getSettings();
    const wrongIds = store.get('wrongList', []) || [];
    const favs = review.getFavorites();
    const levelMap = review.levelStats(cards);
    const q = review.buildTodayQueue(cards, settings);

    const summary = {
      review: review.dueCards(cards).length,
      fresh: review.newCards(cards).length,
      wrong: wrongIds.length,
      fav: favs.filter((f) => f.type === 'card').length,
      mastered: levelMap[2] || 0,
      total: cards.length
    };

    let list = [];
    const tab = this.data.activeTab;
    if (tab === 'today') list = q.queue;
    else if (tab === 'wrong') list = db.getCardsByIds(wrongIds);
    else if (tab === 'fav') list = db.getCardsByIds(favs.filter((f) => f.type === 'card').map((f) => f.id));
    else list = cards;

    this.setData({
      settings,
      summary,
      list,
      grouped: tab === 'all' ? this.groupBySubject(cards) : []
    });
  },

  /** 全部考点按科目分组 */
  groupBySubject(cards) {
    const subjects = db.getSubjectsWithChapters();
    return subjects
      .map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        count: s.cards.length,
        mastered: s.cards.filter((c) => {
          const p = review.readProgress()[c.id];
          return p && p.level === 2;
        }).length
      }))
      .filter((s) => s.count > 0);
  },

  /** 开始背诵当前 Tab 内容 */
  onStart() {
    const tab = this.data.activeTab;
    if (tab === 'today') return wx.navigateTo({ url: '/pages-study/recite/recite?mode=today' });
    if (tab === 'wrong') {
      if (!this.data.list.length) return wx.showToast({ title: '暂无错题', icon: 'none' });
      return wx.navigateTo({ url: '/pages-study/recite/recite?mode=wrong' });
    }
    if (tab === 'fav') {
      const ids = review.getFavorites().filter((f) => f.type === 'card').map((f) => f.id);
      if (!ids.length) return wx.showToast({ title: '暂无收藏', icon: 'none' });
      store.set('fk_temp_cards', ids);
      return wx.navigateTo({ url: '/pages-study/recite/recite?mode=fav' });
    }
    wx.showToast({ title: '请从科目进入', icon: 'none' });
    wx.switchTab({ url: '/pages/index/index' });
  },

  onCardTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/recite/recite?cardId=${id}` });
  },

  onSubjectTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/chapter/chapter?subjectId=${id}` });
  },

  /** 调整每日新学量 */
  onSetDailyNew() {
    const items = ['10 张 / 天', '20 张 / 天', '30 张 / 天', '50 张 / 天'];
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const val = [10, 20, 30, 50][res.tapIndex];
        review.saveSettings({ dailyNew: val });
        this.refresh();
        wx.showToast({ title: `已设为 ${val} 张/天`, icon: 'none' });
      },
      fail: () => {}
    });
  },

  onShareAppMessage() {
    return { title: '法考主观题速记 · 今日背诵', path: '/pages/review/review' };
  }
});
