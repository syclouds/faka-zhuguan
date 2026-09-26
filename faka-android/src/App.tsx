import { useEffect, useState } from 'react';
import { NavHost } from './router/NavHost.tsx';
import { TabBar } from './components/TabBar.tsx';
import { Toast } from './components/Toast.tsx';
import { Sheet } from './components/Sheet.tsx';
import { useAppStore } from './state/useAppStore.ts';
import { useSafeArea } from './hooks/useSafeArea.ts';
import { useBackButton } from './hooks/useBackButton.ts';
import { useKeyboardOpen } from './hooks/useKeyboard.ts';
import { useReminder } from './hooks/useReminder.ts';
import { get } from './core/store.ts';
import { DISCLAIMER } from './types/index.ts';

/**
 * 应用根组件（T04 版）：
 * - hydrate：启动时 store.init() 载入持久层（内存 → localStorage → Preferences）；
 * - 外观：theme(system/light/dark) 挂 .dark 类 + fontScale 写根变量；
 * - 外设：安全区探针 / 原生返回键 / 键盘避让三个 hook 常驻；
 * - 全局挂载：NavHost + TabBar + Toast + 首次启动免责声明弹层。
 */
export default function App() {
  const booted = useAppStore((s) => s.booted);
  const settings = useAppStore((s) => s.settings);
  const setDisclaimerAck = useAppStore((s) => s.setDisclaimerAck);
  // 首次启动免责声明（读取 disclaimerAck 标记；根组件属基础设施层，直接读存储标记）
  const [needDisclaimer, setNeedDisclaimer] = useState<boolean>(() => !get('disclaimerAck', null));

  useEffect(() => {
    useAppStore.getState().init();
  }, []);

  useSafeArea();
  useBackButton();
  // 全局键盘开合监听（视觉视口 resize + focus 信号；返回键收键盘由 Recite 守卫读取焦点状态）
  useKeyboardOpen();
  // 每日背诵提醒（T05.3：settings.remind/remindAt → 本地通知计划）
  useReminder();

  // 主题：system → matchMedia 探测；light/dark 直接挂类
  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle('dark', dark);
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const onChange = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    apply(settings.theme === 'dark');
    return undefined;
  }, [settings.theme]);

  // 字体缩放
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale || 1));
  }, [settings.fontScale]);

  if (!booted) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-bg text-ink">
        <div className="w-16 h-16 rounded-2xl bg-primary flex flex-col items-center justify-center gap-1.5 py-3.5">
          <span className="block w-8 h-0.5 bg-white rounded-full" />
          <span className="block w-8 h-0.5 bg-white rounded-full" />
          <span className="block w-8 h-0.5 bg-white rounded-full" />
        </div>
        <div className="text-lg font-bold">法考主观题速记</div>
        <div className="text-xs text-sub">启动中…</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg text-ink">
      <NavHost />
      <TabBar />
      <Toast />
      <Sheet open={needDisclaimer} onClose={() => setNeedDisclaimer(false)} title="使用须知">
        <div className="selectable text-sm leading-relaxed text-sub">{DISCLAIMER}</div>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => {
            setDisclaimerAck();
            setNeedDisclaimer(false);
          }}
        >
          我已阅读并理解
        </button>
      </Sheet>
    </div>
  );
}
