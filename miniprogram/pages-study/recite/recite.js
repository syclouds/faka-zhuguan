// pages-study/recite/recite.js — 背诵卡核心页
// 三种进入方式：
//   1) mode=today        今日队列
//   2) subjectId + chapterIndex  指定章节
//   3) cardId            单卡详情
const db = require('../../data/index');
const review = require('../../utils/review');
const { MASTERY, LEVELS } = require('../../utils/constants');
const { shuffle, toast, formatDate } = require('../../utils/util');
const cloud = require('../../utils/cloud');

const MODE_LABEL = { today: '今日背诵', chapter: '章节背诵', single: '单卡学习', wrong: '错题重做' };

Page({
  data: {
    mode: 'today',
    title: '',
    subtitle: '',
    cards: [],
    index: 0,
    total: 0,
    current: null,
    flipped: false,
    showPoints: false,      // 采分点是否展示
    blanks: [],             // 挖空默写数据 [{ k, input }]
    revealAnswer: false,
    progressPercent: 0,
    masteryMap: MASTERY,
    levelTag: '',
    showTip: true,
    finished: false,
    sessionCount: 0,
    sessionStats: { 0: 0, 1: 0, 2: 0 }
  },

  onLoad(options) {
    const cards = this.resolveCards(options);
    if (!cards.length) {
      wx.showModal({
        title: '暂无卡片',
        content: '该范围下没有考点，请返回重新选择',
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    const mode = options.mode || (options.cardId ? 'single' : options.chapterIndex !== undefined ? 'chapter' : 'today');
    let subtitle = `${cards.length} 张`;
    if (options.cardId) subtitle = '单卡查看';
    else if (options.level) subtitle = `${options.level} 级考点 · ${cards.length} 张`;
    else if (mode === 'today') subtitle = `复习 ${cards.length} 张`;
    this.setData({
      mode,
      cards,
      total: cards.length,
      title: MODE_LABEL[mode] || '背诵',
      subtitle: mode === 'single' ? '单卡查看' : subtitle
    });
    this.loadCard(0);
  },

  /** 根据入口参数解析卡片池 */
  resolveCards(options) {
    if (options.cardId) {
      const c = db.getCardById(options.cardId);
      return c ? [c] : [];
    }
    if (options.mode === 'wrong') {
      const ids = require('../../utils/store').get('wrongList', []) || [];
      return db.getCardsByIds(ids);
    }
    if (options.subjectId && options.chapterIndex !== undefined) {
      return db.getCardsByChapterId(options.subjectId, options.chapterIndex).cards;
    }
    if (options.subjectId) {
      return db.getCardsBySubject(options.subjectId);
    }
    // 默认今日队列
    const q = review.buildTodayQueue(db.ALL_CARDS, review.getSettings());
    return q.queue.length ? q.queue : shuffle(db.ALL_CARDS).slice(0, 20);
  },

  /** 载入第 i 张卡 */
  loadCard(i) {
    const card = this.data.cards[i];
    if (!card) return this.setData({ finished: true });
    const progress = review.getCardProgress(card.id);
    const blanks = (card.points || []).map((p, idx) => ({
      idx,
      k: p.k,
      input: '',
      right: false,
      checked: false
    }));

    this.setData({
      index: i,
      current: card,
      flipped: false,
      showPoints: false,
      revealAnswer: false,
      blanks,
      progressPercent: Math.round(((i + 1) / this.data.total) * 100),
      levelTag: progress.level >= 0 ? MASTERY[progress.level].label : '未学',
      showTip: true
    });
    // 记忆已输入的答案（切换卡片时重置）
    this._sessionAnswered = false;
  },

  /** 翻卡 */
  onFlip() {
    this.setData({ flipped: !this.data.flipped, showPoints: !this.data.showPoints });
  },

  /** 采分点逐条自测：点击显示答案 */
  onRevealPoint(e) {
    const idx = e.currentTarget.dataset.idx;
    const blanks = this.data.blanks.slice();
    blanks[idx].checked = true;
    blanks[idx].right = true;
    this.setData({ blanks });
  },

  /** 输入关键词 */
  onBlankInput(e) {
    const idx = e.currentTarget.dataset.idx;
    const value = e.detail.value;
    const blanks = this.data.blanks.slice();
    blanks[idx].input = value;
    blanks[idx].checked = false;
    this.setData({ blanks });
  },

  /** 校验全部挖空 */
  onCheckAll() {
    const card = this.data.current;
    const blanks = this.data.blanks.map((b, i) => {
      const answer = (card.points[i] || {}).k || '';
      const userInput = (b.input || '').replace(/\s/g, '');
      // 判定规则：答案包含于输入 或 输入包含于答案 或 输入达到答案 2/3 长度视为命中
      const hit =
        !!userInput &&
        (answer.indexOf(userInput) > -1 ||
          userInput.indexOf(answer) > -1 ||
          userInput.length >= Math.max(2, Math.ceil(answer.length * 0.6)));
      return Object.assign({}, b, { checked: true, right: hit });
    });
    const rightCount = blanks.filter((b) => b.right).length;
    this.setData({ blanks, showPoints: true, revealAnswer: true });
    toast(`命中 ${rightCount}/${blanks.length} 个关键词`, rightCount === blanks.length ? 'success' : 'none');
  },

  /** 展开/收起答案 */
  onToggleAnswer() {
    this.setData({ revealAnswer: !this.data.revealAnswer, showPoints: true });
  },

  /** 标记掌握度并进入下一张 */
  onMark(e) {
    const level = Number(e.currentTarget.dataset.level);
    const card = this.data.current;
    if (!card) return;

    review.markLevel(card.id, level);
    if (level === 2) review.clearWrong(card.id);
    review.touchStat(1);

    const sessionStats = Object.assign({}, this.data.sessionStats);
    sessionStats[level] = (sessionStats[level] || 0) + 1;
    this.setData({ sessionStats, sessionCount: this.data.sessionCount + 1 });

    this.next();
  },

  next() {
    const nextIndex = this.data.index + 1;
    if (nextIndex >= this.data.total) {
      this.finish();
    } else {
      this.loadCard(nextIndex);
    }
  },

  prev() {
    if (this.data.index > 0) this.loadCard(this.data.index - 1);
  },

  /** 上一张/下一张手势按钮 */
  onNext() {
    this.next();
  },

  finish() {
    this.setData({ finished: true });
    // 完成后静默上传进度
    cloud.pushProgress();
  },

  /** 重做错题 */
  onRedoWrong() {
    const wrongIds = require('../../utils/store').get('wrongList', []) || [];
    if (!wrongIds.length) return toast('太棒了，没有错题');
    const cards = db.getCardsByIds(wrongIds);
    this.setData({
      cards,
      total: cards.length,
      mode: 'wrong',
      title: MODE_LABEL.wrong,
      subtitle: `${cards.length} 张`,
      finished: false,
      sessionCount: 0,
      sessionStats: { 0: 0, 1: 0, 2: 0 }
    });
    this.loadCard(0);
  },

  /** 再来一轮（未掌握优先） */
  onRestart() {
    const cards = shuffle(this.data.cards);
    this.setData({
      cards,
      total: cards.length,
      finished: false,
      sessionCount: 0,
      sessionStats: { 0: 0, 1: 0, 2: 0 }
    });
    this.loadCard(0);
  },

  onBackHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  /** 收藏当前卡 */
  onFav() {
    const card = this.data.current;
    const on = review.toggleFavorite(card.id, 'card', card.title);
    toast(on ? '已收藏' : '已取消收藏', on ? 'success' : 'none');
  },

  /** 复制卡片内容，方便整理到笔记 */
  onCopy() {
    const c = this.data.current;
    const lines = [
      `【${c.subjectName}】${c.title}`,
      `核心：${c.core}`,
      '',
      '采分点：',
      ...(c.points || []).map((p, i) => `${i + 1}. ${p.k}：${p.v}`),
      '',
      '法条依据：',
      ...(c.clauses || []),
      '',
      `易错提示：${c.trick}`
    ];
    wx.setClipboardData({
      data: lines.join('\n'),
      success: () => toast('已复制到剪贴板', 'success')
    });
  },

  /** 学习提示 */
  onHideTip() {
    this.setData({ showTip: false });
  },

  onShareAppMessage() {
    const c = this.data.current;
    return {
      title: c ? `法考考点：${c.title}` : '法考主观题速记',
      path: c ? `/pages-study/recite/recite?cardId=${c.id}` : '/pages/index/index'
    };
  }
});
