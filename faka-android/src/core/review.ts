/**
 * 复习引擎（等价迁移小程序 utils/review.js，ARCH T02.2）
 * 红线：三档间隔数组原样 [0,1,1,2,4,7,15] / [1,2,4,7,15,30] / [3,7,15,30,60]；
 * stage 推进 0→归零 / 1→原地 / 2→+1；「没记住」进错题本、「记住了」移出；
 * due 存本地当天 00:00 时间戳；stats.days[].date 用 new Date().toDateString()。
 */
import {
  emptyProgress,
  computeRecord,
  filterDue,
  filterNew,
  buildQueue,
  levelStats as algoLevelStats
} from '../../../shared/review-algo.js';
import { todayStart, dayDiff, shuffle } from '../../../shared/util.js';
import type {
  ReviewItem,
  ProgressMap,
  ProgressRecord,
  Favorite,
  FavKind,
  Settings,
  Stats,
  UserCard
} from '../types/index.ts';
import { DEFAULT_SETTINGS } from '../types/index.ts';
import { get, set } from './store.ts';

export function readProgress(): ProgressMap {
  return get<ProgressMap>('progress', {}) || {};
}

export function writeProgress(p: ProgressMap): void {
  set('progress', p);
}

/** 读取单卡进度（无记录返回 level=-1 表示未学） */
export function getCardProgress(cardId: string): ProgressRecord {
  const p = readProgress();
  return p[cardId] || emptyProgress();
}

/** 掌握度分布统计（-1 未学 / 0 / 1 / 2） */
export function levelStats(items: ReviewItem[]): Record<string, number> {
  // shared/review-algo.js 为 JS，progress 形参类型由 JSDoc 推断；此处适配其参数类型
  return algoLevelStats(
    items,
    readProgress() as unknown as Parameters<typeof algoLevelStats>[1]
  ) as Record<string, number>;
}

/**
 * 标记掌握度并推进复习阶段
 * @param level 0未掌握 1模糊 2已掌握
 */
export function markLevel(cardId: string, level: 0 | 1 | 2): ProgressRecord {
  const p = readProgress();
  const rec = computeRecord(
    level,
    p[cardId] as unknown as Parameters<typeof computeRecord>[1]
  ) as ProgressRecord;
  p[cardId] = rec;
  writeProgress(p);

  // 答错进入错题本（去重）
  if (level === 0) {
    const wrongList = get<string[]>('wrongList', []) || [];
    if (wrongList.indexOf(cardId) === -1) {
      wrongList.push(cardId);
      set('wrongList', wrongList);
    }
  }
  return rec;
}

/** 已掌握时从错题本移除 */
export function clearWrong(cardId: string): void {
  const wrongList = get<string[]>('wrongList', []) || [];
  const idx = wrongList.indexOf(cardId);
  if (idx > -1) {
    wrongList.splice(idx, 1);
    set('wrongList', wrongList);
  }
}

/** 直接从错题本移除（案例采分点回流项由页面主动移除时用） */
export function removeWrong(ref: string): void {
  clearWrong(ref);
}

/** 到期复习卡（due <= 今天 00:00） */
export function dueCards(items: ReviewItem[]): ReviewItem[] {
  return filterDue(items, readProgress()) as ReviewItem[];
}

/** 未学过的卡 */
export function newCards(items: ReviewItem[]): ReviewItem[] {
  return filterNew(items, readProgress()) as ReviewItem[];
}

/** 生成今日学习队列：先到期复习，再按重要度补新卡 */
export function buildTodayQueue(
  items: ReviewItem[],
  opts: { dailyNew?: number; dailyReview?: number } = {}
): { review: ReviewItem[]; fresh: ReviewItem[]; queue: ReviewItem[] } {
  return buildQueue(items, readProgress(), opts, shuffle) as {
    review: ReviewItem[];
    fresh: ReviewItem[];
    queue: ReviewItem[];
  };
}

/* ============ 收藏 ============ */

export function getFavorites(): Favorite[] {
  return get<Favorite[]>('favorites', []) || [];
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

/** 切换收藏，返回切换后的状态 */
export function toggleFavorite(id: string, kind: FavKind = 'card', title = ''): boolean {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.id === id);
  if (idx > -1) {
    list.splice(idx, 1);
    set('favorites', list);
    return false;
  }
  list.unshift({ id, kind, title, at: Date.now() });
  set('favorites', list);
  return true;
}

/* ============ 考试日期 ============ */

export function getExamDate(): number {
  return get<number>('examDate', 0) || 0;
}

export function setExamDate(ts: number): void {
  set('examDate', ts || 0);
}

/* ============ 设置 ============ */

export function getSettings(): Settings {
  const stored = get<Partial<Settings> | null>('settings', null);
  // 合并默认值：旧版本存量缺字段时补齐（含小程序迁移数据）
  return { ...DEFAULT_SETTINGS, ...(stored || {}) } as Settings;
}

export function saveSettings(patch: Partial<Settings>): Settings {
  const s = { ...getSettings(), ...patch };
  set('settings', s);
  return s;
}

/* ============ 用户自建卡片 ============ */

export function getUserCards(): UserCard[] {
  return get<UserCard[]>('cards', []) || [];
}

export function addUserCard(card: Partial<UserCard> & { id: string; title: string }): UserCard[] {
  const list = getUserCards();
  list.unshift({ source: 'user', createdAt: Date.now(), ...card } as UserCard);
  set('cards', list);
  return list;
}

export function removeUserCard(id: string): void {
  set(
    'cards',
    getUserCards().filter((c) => c.id !== id)
  );
}

/* ============ 重置 ============ */

export function resetAll(): void {
  set('progress', {});
  set('wrongList', []);
  set('favorites', []);
  set('stats', { days: [], totalCards: 0, streak: 0 });
  set('caseRecords', {});
}

/** 学习统计（连续打卡天数 / 今日完成量） */
export function touchStat(count = 1): Stats {
  const stats: Stats =
    get<Stats>('stats', { days: [], totalCards: 0, streak: 0 }) || { days: [], totalCards: 0, streak: 0 };
  const today = new Date().toDateString();
  let entry = stats.days.find((d) => d.date === today);
  if (!entry) {
    entry = { date: today, count: 0 };
    stats.days.push(entry);
  }
  entry.count += count;
  stats.totalCards = (stats.totalCards || 0) + count;

  // 计算连续天数：今天没学则从昨天起算（与小程序逐字一致）
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = cursor.toDateString();
    if (stats.days.some((d) => d.date === key && d.count > 0)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  stats.streak = streak;
  set('stats', stats);
  return stats;
}

/** 今日已完成数（stats.days 中今天的 count） */
export function todayCount(): number {
  const stats = get<Stats>('stats', { days: [], totalCards: 0, streak: 0 });
  const today = new Date().toDateString();
  const entry = (stats.days || []).find((d) => d.date === today);
  return entry ? entry.count : 0;
}

export { todayStart, dayDiff };
