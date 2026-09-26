/**
 * Zustand 全局状态（ARCH §9.2）
 * 页面不直接调 core/store，统一走本 store 的 action → 保证 UI 与持久化同步刷新。
 */
import { create } from 'zustand';
import type {
  CaseRecord,
  DraftMap,
  Favorite,
  FavKind,
  ProgressMap,
  Settings,
  Stats,
  UserCard,
  WrongRef
} from '../types/index.ts';
import * as review from '../core/review.ts';
import * as casesCore from '../core/cases.ts';
import { get, set } from '../core/store.ts';

export interface AppStore {
  booted: boolean;
  progress: ProgressMap;
  settings: Settings;
  stats: Stats;
  wrongList: WrongRef[];
  favorites: Favorite[];
  userCards: UserCard[];
  caseRecords: Record<string, CaseRecord>;
  drafts: DraftMap;

  /** main.tsx hydrate 后调用：从持久层载入全部状态 */
  init(): void;
  /** 标记掌握度 + 推进队列 + 计入统计（Recite 三档按钮） */
  markLevel(cardId: string, level: 0 | 1 | 2): void;
  /** 切换收藏，返回切换后状态 */
  toggleFavorite(id: string, kind: FavKind, title: string): boolean;
  removeWrong(ref: WrongRef): void;
  saveSettings(patch: Partial<Settings>): void;
  setExamDate(ts: number): void;
  addUserCard(card: Omit<UserCard, 'source' | 'createdAt'>): void;
  removeUserCard(id: string): void;
  /** 草稿自动保存（案例设问 key=qid；论述 key=essay-<id>） */
  saveDraft(key: string, text: string): void;
  /** 案例采分点自评 */
  recordPoint(caseId: string, qid: string, spId: string, hit: boolean): void;
  /** 案例完成：attempts+1 + 错题回流 + 计入统计 */
  finishCase(caseId: string): void;
  resetAll(): void;
  /** 导入备份后全量重载 */
  reload(): void;
  setDisclaimerAck(): void;
}

export const useAppStore = create<AppStore>((setStore, getState) => ({
  booted: false,
  progress: {},
  settings: {
    dailyNew: 20,
    dailyReview: 60,
    showKeywordTip: true,
    examDate: 0,
    theme: 'system',
    fontScale: 1,
    remind: false,
    remindAt: '21:00'
  },
  stats: { days: [], totalCards: 0, streak: 0 },
  wrongList: [],
  favorites: [],
  userCards: [],
  caseRecords: {},
  drafts: {},

  init() {
    setStore({
      booted: true,
      progress: review.readProgress(),
      settings: review.getSettings(),
      stats: get<Stats>('stats', { days: [], totalCards: 0, streak: 0 }) || {
        days: [],
        totalCards: 0,
        streak: 0
      },
      wrongList: get<WrongRef[]>('wrongList', []) || [],
      favorites: review.getFavorites(),
      userCards: review.getUserCards(),
      caseRecords: casesCore.getCaseRecords(),
      drafts: get<DraftMap>('drafts', {}) || {}
    });
  },

  markLevel(cardId, level) {
    review.markLevel(cardId, level);
    // 「记住了」同步移出错题本（与小程序 pages-study/recite/recite.js:166 行为等价）
    if (level === 2) review.clearWrong(cardId);
    review.touchStat(1);
    setStore({
      progress: review.readProgress(),
      wrongList: get<WrongRef[]>('wrongList', []) || [],
      stats: get<Stats>('stats', { days: [], totalCards: 0, streak: 0 })
    });
  },

  toggleFavorite(id, kind, title) {
    const nowFav = review.toggleFavorite(id, kind, title);
    setStore({ favorites: review.getFavorites() });
    return nowFav;
  },

  removeWrong(ref) {
    review.removeWrong(ref);
    setStore({ wrongList: get<WrongRef[]>('wrongList', []) || [] });
  },

  saveSettings(patch) {
    const s = review.saveSettings(patch);
    setStore({ settings: { ...s } });
  },

  setExamDate(ts) {
    review.setExamDate(ts);
    // settings.examDate 保持同步（备份契约 §4.6/§4.7）
    const s = review.saveSettings({ examDate: ts || 0 });
    setStore({ settings: { ...s } });
  },

  addUserCard(card) {
    review.addUserCard(card as UserCard);
    setStore({ userCards: review.getUserCards() });
  },

  removeUserCard(id) {
    review.removeUserCard(id);
    setStore({ userCards: review.getUserCards() });
  },

  saveDraft(key, text) {
    const drafts = { ...(get<DraftMap>('drafts', {}) || {}) };
    drafts[key] = { text, updatedAt: Date.now() };
    set('drafts', drafts);
    setStore({ drafts });
  },

  recordPoint(caseId, qid, spId, hit) {
    casesCore.recordPoint(caseId, qid, spId, hit);
    setStore({ caseRecords: casesCore.getCaseRecords() });
  },

  finishCase(caseId) {
    casesCore.finishCase(caseId);
    setStore({
      caseRecords: casesCore.getCaseRecords(),
      wrongList: get<WrongRef[]>('wrongList', []) || [],
      stats: get<Stats>('stats', { days: [], totalCards: 0, streak: 0 })
    });
  },

  resetAll() {
    review.resetAll();
    getState().init();
  },

  reload() {
    getState().init();
  },

  setDisclaimerAck() {
    set('disclaimerAck', { at: Date.now() });
  }
}));
