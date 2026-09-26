import { useEffect, useRef, useState } from 'react';
import { onToast, type ToastKind } from '../utils/toast.ts';

const TOAST_MS = 1800;

/** 全局轻提示挂载点：App 根部唯一实例，订阅 utils/toast 事件总线 */
export function Toast() {
  const [msg, setMsg] = useState('');
  const [kind, setKind] = useState<ToastKind>('info');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const off = onToast((m, k) => {
      setMsg(m);
      setKind(k);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMsg(''), TOAST_MS);
    });
    return () => {
      off();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!msg) return null;
  const color =
    kind === 'success' ? 'bg-success text-white' : kind === 'error' ? 'bg-danger text-white' : 'bg-ink text-bg';
  return (
    <div className="fixed left-1/2 bottom-24 z-60 pointer-events-none">
      <div className={`toast-in px-4 py-2 rounded-full text-sm shadow-lg ${color}`}>{msg}</div>
    </div>
  );
}
