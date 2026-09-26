/**
 * 默写命中判定（与小程序 pages-study/recite onCheckAll 规则逐字等价，ARCH §9.6）
 *
 * 原规则：答案包含于输入 或 输入包含于答案 或 输入达到答案 60% 长度（且 ≥2 字）视为命中；
 * 输入先去掉全部空白字符再判定。
 */

/**
 * @param userInput 用户输入（内部去空白）
 * @param answer    采分点关键词 p.k
 */
export function judgeHit(userInput: string, answer: string): boolean {
  const input = (userInput || '').replace(/\s/g, '');
  const ans = answer || '';
  return (
    !!input &&
    (ans.includes(input) ||
      input.includes(ans) ||
      input.length >= Math.max(2, Math.ceil(ans.length * 0.6)))
  );
}
