// pages-study/essay-detail/essay-detail.js — 论述模板详情 + 背诵模式
const db = require('../../data/index');
const review = require('../../utils/review');
const { LEVELS } = require('../../utils/constants');
const { toast, charCount } = require('../../utils/util');

Page({
  data: {
    essay: null,
    levelMap: LEVELS,
    mode: 'detail',       // detail | recite
    reciteStep: 0,        // 背诵模式当前步骤
    hideFrame: false,     // 背诵模式是否隐藏框架细节
    fav: false,
    draft: '',            // 答题草稿
    draftCount: 0,
    phrasesChecked: []    // 金句背诵勾选
  },

  onLoad(options) {
    const essay = db.getEssayById(options.id);
    if (!essay) {
      wx.showToast({ title: '模板不存在', icon: 'none' });
      return setTimeout(() => wx.navigateBack(), 800);
    }
    wx.setNavigationBarTitle({ title: essay.title });
    this.setData({
      essay,
      mode: options.mode === 'recite' ? 'recite' : 'detail',
      fav: review.isFavorite(essay.id),
      phrasesChecked: essay.phrases.map(() => false)
    });
  },

  /** 切换收藏 */
  onFav() {
    const on = review.toggleFavorite(this.data.essay.id, 'essay', this.data.essay.title);
    this.setData({ fav: on });
    toast(on ? '已收藏' : '已取消收藏', on ? 'success' : 'none');
  },

  /** 进入背诵模式 */
  onStartRecite() {
    this.setData({ mode: 'recite', reciteStep: 0, hideFrame: true });
  },

  onExitRecite() {
    this.setData({ mode: 'detail', hideFrame: false });
  },

  /** 背诵模式：显示当前步骤答案 */
  onReveal() {
    this.setData({ hideFrame: false });
  },

  onNextStep() {
    const { essay, reciteStep } = this.data;
    if (reciteStep >= essay.frame.length - 1) {
      toast('框架已过完，试着默写一遍', 'none');
      return;
    }
    this.setData({ reciteStep: reciteStep + 1, hideFrame: true });
  },

  onPrevStep() {
    if (this.data.reciteStep > 0) {
      this.setData({ reciteStep: this.data.reciteStep - 1, hideFrame: true });
    }
  },

  /** 金句勾选（背下来打勾） */
  onTogglePhrase(e) {
    const idx = e.currentTarget.dataset.idx;
    const arr = this.data.phrasesChecked.slice();
    arr[idx] = !arr[idx];
    this.setData({ phrasesChecked: arr });
  },

  /** 草稿输入 */
  onDraftInput(e) {
    const draft = e.detail.value;
    this.setData({ draft, draftCount: charCount(draft) });
  },

  /** 按模板生成答题框架草稿 */
  onGenerateDraft() {
    const e = this.data.essay;
    const lines = [
      `【${e.title}】`,
      '',
      ...e.frame.map((f, i) => `${i + 1}. ${f.k}\n   ▸ ${f.v}`),
      '',
      '【可用金句】',
      ...e.phrases.map((p) => `· ${p}`),
      '',
      `【易错提示】${e.trap}`
    ];
    this.setData({ draft: lines.join('\n'), draftCount: charCount(lines.join('\n')) });
    toast('已生成框架草稿', 'success');
  },

  onCopy() {
    const e = this.data.essay;
    const text = [
      e.title,
      '',
      '答题框架：',
      ...e.frame.map((f, i) => `${i + 1}. ${f.k}：${f.v}`),
      '',
      '万能金句：',
      ...e.phrases.map((p) => `· ${p}`),
      '',
      '可替换槽位：',
      ...e.fill.map((f) => `· ${f}`),
      '',
      `示范段落：\n${e.sample}`,
      '',
      `易错提示：${e.trap}`
    ].join('\n');
    wx.setClipboardData({
      data: text,
      success: () => toast('已复制完整模板', 'success')
    });
  },

  onShareAppMessage() {
    const e = this.data.essay;
    return {
      title: `法考论述模板：${e.title}`,
      path: `/pages-study/essay-detail/essay-detail?id=${e.id}`
    };
  }
});
