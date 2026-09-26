// pages/mine/mine.js — 我的：统计、设置、云同步、自建卡片
const db = require('../../data/index');
const review = require('../../utils/review');
const cloud = require('../../utils/cloud');
const store = require('../../utils/store');
const { toast } = require('../../utils/util');

Page({
  data: {
    stats: {},
    levelStats: {},
    total: 0,
    percent: 0,
    streak: 0,
    trend: [],
    settings: {},
    cloudReady: false,
    cloudTip: cloud.CLOUD_TIP,
    openid: '',
    userCards: []
  },

  onLoad() {
    const app = getApp();
    this.setData({
      cloudReady: !!(app && app.globalData.cloudReady),
      openid: (app && app.globalData.openid) || ''
    });
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const cards = db.ALL_CARDS;
    const levelMap = review.levelStats(cards);
    const stats = store.get('stats', { days: [], totalCards: 0, streak: 0 });
    const mastered = levelMap[2] || 0;
    const learned = cards.length - (levelMap['-1'] || 0);

    // 近 7 天学习趋势
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const entry = (stats.days || []).find((x) => x.date === key);
      trend.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        count: entry ? entry.count : 0
      });
    }
    const maxCount = Math.max(1, ...trend.map((t) => t.count));
    trend.forEach((t) => { t.height = Math.round((t.count / maxCount) * 100); });

    this.setData({
      stats,
      levelStats: {
        unknown: levelMap[0] || 0,
        fuzzy: levelMap[1] || 0,
        mastered,
        fresh: levelMap['-1'] || 0,
        learned
      },
      total: cards.length,
      percent: cards.length ? Math.round((mastered / cards.length) * 100) : 0,
      streak: stats.streak || 0,
      trend,
      settings: review.getSettings(),
      userCards: review.getUserCards()
    });
  },

  /** 手动同步进度到云端 */
  async onSync() {
    if (!this.data.cloudReady) {
      return wx.showModal({
        title: '云开发未启用',
        content: this.data.cloudTip,
        showCancel: false,
        confirmText: '知道了'
      });
    }
    wx.showLoading({ title: '同步中…' });
    const pull = await cloud.pullProgress();
    const push = await cloud.pushProgress();
    wx.hideLoading();
    if (push) {
      toast(`同步完成（合并 ${(pull && pull.merged) || 0} 条）`, 'success');
      this.refresh();
    } else {
      toast('同步失败，请检查云函数是否部署');
    }
  },

  /** 调整设置 */
  onSettingTap(e) {
    const key = e.currentTarget.dataset.key;
    const map = {
      dailyNew: { items: ['10 张', '20 张', '30 张', '50 张'], values: [10, 20, 30, 50], label: '每日新学上限' },
      dailyReview: { items: ['30 张', '60 张', '100 张', '不限'], values: [30, 60, 100, 9999], label: '每日复习上限' }
    };
    const cfg = map[key];
    if (!cfg) {
      if (key === 'showKeywordTip') {
        const on = !this.data.settings.showKeywordTip;
        review.saveSettings({ showKeywordTip: on });
        this.refresh();
      }
      return;
    }
    wx.showActionSheet({
      itemList: cfg.items,
      success: (res) => {
        review.saveSettings({ [key]: cfg.values[res.tapIndex] });
        this.refresh();
        toast(`${cfg.label}已更新`, 'success');
      },
      fail: () => {}
    });
  },

  /** 查看错题本 */
  onWrongBook() {
    wx.switchTab({ url: '/pages/review/review' });
  },

  /** 前往收藏 */
  onFavorites() {
    const favs = review.getFavorites();
    if (!favs.length) return toast('还没有收藏内容');
    wx.switchTab({ url: '/pages/review/review' });
  },

  /** 自建卡片 */
  onAddCard() {
    wx.showModal({
      title: '新增自定义考点',
      editable: true,
      placeholderText: '请输入考点标题',
      success: (res) => {
        if (!res.confirm || !res.content) return;
        wx.showModal({
          title: '补充采分点',
          editable: true,
          placeholderText: '多个采分点用 | 分隔',
          success: (r2) => {
            if (!r2.confirm) return;
            const points = (r2.content || '')
              .split(/[|｜]/)
              .filter(Boolean)
              .map((s) => {
                const parts = s.split(/[:：]/);
                return { k: (parts[0] || '').trim(), v: (parts[1] || '').trim() };
              });
            review.addUserCard({
              id: `user-${Date.now()}`,
              chapter: '我的笔记',
              title: res.content,
              level: 'A',
              core: (points[0] && points[0].v) || '自定义考点',
              points,
              clauses: [],
              trick: '',
              subjectId: 'civil',
              subjectName: '自定义',
              subjectShort: '我的',
              subjectColor: '#2B6CF6'
            });
            this.refresh();
            toast('已添加，可在搜索中查到', 'success');
          }
        });
      }
    });
  },

  /** 重置学习数据 */
  onReset() {
    wx.showModal({
      title: '确认重置？',
      content: '将清空所有学习进度、错题本和收藏，此操作不可恢复。',
      confirmColor: '#E8453C',
      success: (res) => {
        if (!res.confirm) return;
        review.resetAll();
        this.refresh();
        toast('已重置学习数据', 'success');
      }
    });
  },

  /** 关于 */
  onAbout() {
    wx.showModal({
      title: '关于本小程序',
      content: `法考主观题速记 v1.0.0\n\n收录 ${db.ALL_CARDS.length} 个结构化考点、${db.getStats().totalEssay} 套论述模板，采用掌握度+艾宾浩斯间隔的复习算法。\n\n内容依据现行法律法规及司法解释整理，仅供备考参考，正式作答请以最新法律法规和官方教材为准。`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShareAppMessage() {
    return { title: '法考主观题速记 · 考点卡片 + 论述模板', path: '/pages/index/index' };
  }
});
