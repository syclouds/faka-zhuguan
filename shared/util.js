/**
 * 【生成物】由 tools/gen-shared.mjs 生成，勿手改。
 * 复制自小程序 utils/util.js 的纯函数（剔除依赖 wx 的 toast）。
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 把日期归零到当天 00:00 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 今天 00:00 的时间戳 */
export function todayStart() {
  return startOfDay(new Date()).getTime();
}

/** 相对天数差（正数表示未来） */
export function dayDiff(ts) {
  return Math.round((startOfDay(ts).getTime() - todayStart()) / MS_PER_DAY);
}

/** n 天后 00:00 的时间戳 */
export function daysLater(n) {
  return todayStart() + n * MS_PER_DAY;
}

/** 格式化为 YYYY-MM-DD */
export function formatDate(ts) {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 距离考试天数 */
export function daysUntil(ts) {
  return Math.max(0, dayDiff(ts));
}

/** 洗牌（Fisher–Yates，不改原数组） */
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 字数统计（中文按字算） */
export function charCount(str) {
  return (str || '').replace(/\s/g, '').length;
}
