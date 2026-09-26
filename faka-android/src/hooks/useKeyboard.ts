/**
 * 软键盘开合探测（默写返回拦截用，ARCH §6.2 规则 3）
 * 信号：① visualViewport 高度骤降（adjustResize 下最可靠）；
 *      ② focusin/focusout 兜底（不支持 visualViewport 的旧 WebView）。
 */
import { useEffect, useState } from 'react';

export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = (window as unknown as { visualViewport?: VisualViewport }).visualViewport;
    let baseline = vv ? vv.height : 0;
    let byViewport = false;
    let byFocus = false;

    const apply = () => setOpen(byViewport || byFocus);

    const onResize = () => {
      if (!vv) return;
      if (baseline === 0) baseline = vv.height;
      byViewport = vv.height / Math.max(1, baseline) < 0.85;
      if (!byViewport) baseline = vv.height; // 收起后重置基线
      apply();
    };

    const isEditable = (el: EventTarget | null): boolean => {
      const node = el as HTMLElement | null;
      if (!node || !node.tagName) return false;
      const tag = node.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || node.isContentEditable === true;
    };

    const onFocusIn = (e: FocusEvent) => {
      byFocus = isEditable(e.target);
      apply();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (isEditable(e.target)) {
        byFocus = false;
        apply();
      }
    };

    vv?.addEventListener('resize', onResize);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      vv?.removeEventListener('resize', onResize);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return open;
}

/** 编程收起软键盘：blur 当前活动输入框 */
export function blurActiveInput(): void {
  try {
    if (typeof document === 'undefined') return;
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      active.blur();
    }
  } catch {
    /* ignore */
  }
}
