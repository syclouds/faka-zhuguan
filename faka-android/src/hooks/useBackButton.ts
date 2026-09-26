/**
 * Capacitor appBackButton → router.handleBack()（A-4）
 * - consumed：守卫消费（背诵卡收键盘/弹确认）；
 * - popped：栈内逐级返回；
 * - armed：Tab 根页第一次按 → toast「再按一次退出」；
 * - exit：2s 内第二次按 → App.exitApp()（PWA 环境降级为关闭窗口提示）。
 * PWA/浏览器环境无此事件：返回键走 NavHost 的 popstate 同步。
 */
import { useEffect, useRef } from 'react';
import { router } from '../router/stack.ts';
import { toast } from '../utils/toast.ts';

export function useBackButton(): void {
  const exitRef = useRef<() => void>(() => {});

  useEffect(() => {
    let removed = false;
    let cleanup: (() => void) | null = null;

    exitRef.current = () => {
      try {
        // 动态加载确保 Node / PWA 不触发
        void import('@capacitor/app').then(({ App }) => App.exitApp());
      } catch {
        /* 环境不支持 */
      }
    };

    (async () => {
      try {
        if (typeof window === 'undefined') return;
        const { App } = await import('@capacitor/app');
        if (removed) return;
        const handle = await App.addListener('backButton', () => {
          const r = router.handleBack();
          if (r === 'armed') toast('再按一次退出');
          else if (r === 'exit') exitRef.current();
        });
        // App 切后台/杀进程前全量补写 Preferences（§5.3）
        const pauseHandle = await App.addListener('pause', () => {
          void import('../core/store.ts').then(({ flushAll }) => flushAll());
        });
        cleanup = () => {
          void handle.remove();
          void pauseHandle.remove();
        };
      } catch {
        /* PWA / 浏览器 / Node：无原生返回键 */
      }
    })();

    return () => {
      removed = true;
      if (cleanup) cleanup();
    };
  }, []);
}
