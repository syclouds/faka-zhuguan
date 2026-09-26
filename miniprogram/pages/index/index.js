// pages/index/index.js — 考点总览：考试倒计时 + 今日任务 + 科目章节导航
const db = require('../../data/index');
const review = require('../../utils/review');
const { LEVELS } = require('../../utils/constants');
const { formatDate, daysUntil, toast } = require('../../utils/util');
const cloud = require('../../utils/cloud');

Page({
  data: {
    examDate: 0,
    examDateText: '',
    daysLeft: 0,
    stats: { totalCards: 0, totalSubjects: 0, totalEssay: 0, totalSLevel: 0 },
    todayNew: 0,
    todayReview: 0,
    todayDone: 0,
    streak: 0,
    masteredCount: 0,
    totalCount: 0,
    progressPercent: 0,
    subjects: [],
    levelLegend: Object.keys(LEVELS).map((k) => ({ key: k, ...LEVELS[k] })),
    hotCards: [],
    loading: true
  },

  onLoad() {
    this.refresh();
    // 首次进入尝试拉取云端进度（静默）
    cloud.pullProgress().then((r) => {
      if (r && r.merged) this.refresh();
    });
  },

  onShow() {
    this.refresh();
  },

  onPullDownRefresh() {
    cloud.pullProgress().finally(() => {
      this.refresh();
      wx.stopPullDownRefresh();
    });
  },

  refresh() {
    const cards = db.ALL_CARDS;
    const settings = review.getSettings();
    const examDate = review.getExamDate();
    const levelMap = review.levelStats(cards);

    // 今日队列：与背诵页共用同一构建逻辑，保证数字一致
    const q = review.buildTodayQueue(cards, settings);
    const stats = require('../../utils/store').get('stats', { days: [], streak: 0, totalCards: 0 });

    const todayKey = new Date().toDateString();
    const todayEntry = (stats.days || []).find((d) => d.date === todayKey);

    const mastered = levelMap[2] || 0;
    const learned = cards.length - (levelMap['-1'] || 0);

    this.setData({
      examDate,
      examDateText: examDate ? formatDate(examDate) : '',
      daysLeft: examDate ? daysUntil(examDate) : 0,
      stats: db.getStats(),
      todayNew: q.fresh.length,
      todayReview: q.review.length,
      todayDone: todayEntry ? todayEntry.count : 0,
      streak: stats.streak || 0,
      masteredCount: mastered,
      totalCount: cards.length,
      progressPercent: cards.length ? Math.round((mastered / cards.length) * 100) : 0,
      subjects: db.getSubjectsWithChapters(),
      hotCards: cards.filter((c) => c.level === 'S').slice(0, 6),
      loading: false
    });
  },

  /** 设置 / 修改考试日期 */
  onPickExamDate() {
    wx.showActionSheet({
      itemList: ['2026年10月18日（主观题参考）', '自定义…', '清除日期'],
      success: (res) => {
        if (res.tapIndex === 0) {
          review.setExamDate(new Date('2026-10-18T00:00:00').getTime());
          this.refresh();
          toast('已设置考试日期');
        } else if (res.tapIndex === 1) {
          this.setData({ showDatePicker: true });
        } else {
          review.setExamDate(0);
          this.refresh();
        }
      },
      fail: () => { /* 用户取消，忽略 */ }
    });
  },

  onDateChange(e) {
    const value = e.detail.value; // 'YYYY-MM-DD'
    const ts = new Date(`${value}T00:00:00`).getTime();
    review.setExamDate(ts);
    this.setData({ showDatePicker: false });
    this.refresh();
    toast('已设置考试日期');
  },

  onDatePickerCancel() {
    this.setData({ showDatePicker: false });
  },

  /** 开始今日背诵 */
  onStartToday() {
    const q = review.buildTodayQueue(db.ALL_CARDS, review.getSettings());
    if (!q.queue.length) {
      wx.showModal({
        title: '今日任务已完成',
        content: '没有到期复习的卡片了，去章节里挑新考点吧？',
        confirmText: '去挑新考点',
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: '/pages/review/review' });
        }
      });
      return;
    }
    wx.navigateTo({ url: '/pages-study/recite/recite?mode=today' });
  },

  /** 进入科目（跳章节页） */
  onSubjectTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/chapter/chapter?subjectId=${id}` });
  },

  /** 进入指定章节 */
  onChapterTap(e) {
    const { subjectId, index } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/recite/recite?subjectId=${subjectId}&chapterIndex=${index}` });
  },

  /** 查看考点详情 */
  onCardTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages-study/recite/recite?cardId=${id}` });
  },

  onSearch() {
    wx.navigateTo({ url: '/pages-study/search/search' });
  },

  onExamTip() {
    wx.showModal({
      title: '主观题时间参考',
      content: '近年法考主观题通常在 10 月中下旬举行（如 2026 年为 10 月 18 日，以司法部公告为准）。建议按倒计时 60 天规划三轮：\n① 考点卡片全过一遍\n② 采分点默写强化\n③ 论述模板背诵+案例训练',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShareAppMessage() {
    return {
      title: `法考主观题速记｜距考试还有${this.data.daysLeft}天`,
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    return { title: '法考主观题速记 · 考点卡片 + 论述模板' };
  }
});
