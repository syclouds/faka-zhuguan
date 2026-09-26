/**
 * 轻提示（替代 wx.showToast）：事件总线 + Toast 组件订阅（components/Toast.tsx）。
 * 不依赖 React 运行时，Node 冒烟测试可直接调用。
 */
export type ToastKind = 'info' | 'success' | 'error';

type Listener = (msg: string, kind: ToastKind) => void;

let listener: Listener | null = null;

export function onToast(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function toast(msg: string, kind: ToastKind = 'info'): void {
  try {
    if (listener) listener(msg, kind);
  } catch (err) {
    console.warn('[toast] 展示失败', err);
  }
}
