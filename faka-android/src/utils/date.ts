/**
 * 日期归一化（ARCH §9.6：due 存本地当天 00:00 时间戳）
 * 纯函数实现复用 shared/util.js。
 */
import {
  startOfDay as sd,
  todayStart as ts,
  dayDiff as df,
  daysLater as dl,
  formatDate as fd,
  daysUntil as du,
  MS_PER_DAY
} from '../../../shared/util.js';

export function startOfDay(date: Date | number): Date {
  return sd(date as never);
}
export function todayStart(): number {
  return ts();
}
export function dayDiff(target: number): number {
  return df(target as never);
}
export function daysLater(n: number): number {
  return dl(n);
}
export function formatDate(ts: number): string {
  return fd(ts);
}
export function daysUntil(ts: number): number {
  return du(ts as never);
}
export { MS_PER_DAY };

/** 'YYYY-MM-DD' → 本地当天 00:00 时间戳（非法输入返回 0） */
export function parseDateInput(s: string): number {
  const m = (s || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return 0;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? 0 : startOfDay(d).getTime();
}

/** 'HH:mm' 校验（提醒时间） */
export function isValidHM(s: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(s || '');
}

/** 下次复习日期展示：'今天' / '明天' / 'N天后' / 'MM-DD' */
export function dueLabel(due: number): string {
  if (!due) return '未学';
  const diff = dayDiff(due);
  if (diff <= 0) return '今天';
  if (diff === 1) return '明天';
  if (diff < 7) return `${diff}天后`;
  return formatDate(due).slice(5);
}
