// app.js — 全局入口
const { ensureLogin } = require('./utils/auth');
const store = require('./utils/store');

App({
  globalData: {
    openid: '',
    userInfo: null,
    /** 云开发是否可用（未开通时全功能走本地模式） */
    cloudReady: false,
    /** 今日推荐考点 id 列表，首页与背诵页共享 */
    todayQueue: [],
    systemInfo: null
  },

  onLaunch() {
    this.initCloud();
    this.initSystemInfo();
    this.initLocalData();
    ensureLogin();
  },

  onShow() {
    // 从后台回到前台时刷新今日队列（跨天场景）
    const today = new Date().toDateString();
    if (store.get('lastQueueDate') !== today) {
      store.set('lastQueueDate', today);
    }
  },

  /** 初始化云开发；未开通时降级为纯本地模式，不影响使用 */
  initCloud() {
    if (!wx.cloud) {
      console.warn('[cloud] 当前基础库不支持云开发，降级为本地模式');
      return;
    }
    try {
      wx.cloud.init({
        // env 留空表示使用默认环境；请在微信开发者工具开通云开发后填写环境 ID
        env: wx.cloud.DYNAMIC_CURRENT_ENV,
        traceUser: true
      });
      this.globalData.cloudReady = true;
    } catch (err) {
      console.warn('[cloud] 云开发初始化失败，降级为本地模式', err);
    }
  },

  initSystemInfo() {
    try {
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.globalData.systemInfo = info;
    } catch (err) {
      console.warn('[system] 获取系统信息失败', err);
    }
  },

  /** 首次启动初始化本地存储结构 */
  initLocalData() {
    const progress = store.get('progress');
    if (!progress) {
      store.set('progress', {});
    }
    if (!store.get('settings')) {
      store.set('settings', {
        dailyNew: 20,        // 每日新学上限
        dailyReview: 60,     // 每日复习上限
        showKeywordTip: true // 背诵卡是否默认高亮关键词
      });
    }
    if (!store.get('stats')) {
      store.set('stats', { days: [], totalCards: 0, streak: 0 });
    }
    if (!store.get('wrongList')) {
      store.set('wrongList', []);
    }
    if (!store.get('favorites')) {
      store.set('favorites', []);
    }
  }
});
