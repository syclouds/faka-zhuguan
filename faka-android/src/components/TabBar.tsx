import { useSyncExternalStore } from 'react';
import { router, TAB_NAMES, type TabName } from '../router/stack.ts';

interface TabDef {
  name: TabName;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { name: 'home', label: '首页', icon: '家' },
  { name: 'review', label: '背诵台', icon: '背' },
  { name: 'mnemonic', label: '口诀', icon: '诀' },
  { name: 'mine', label: '我的', icon: '我' }
];

/**
 * 底部 Tab 栏（A-1）：4 Tab 独立栈切换；≥48dp 触摸目标；安全区垫底。
 * 自带 router 订阅（独立于页面渲染）。
 */
export function TabBar() {
  useSyncExternalStore(
    (cb) => router.subscribe(cb),
    () => router.version
  );
  const active = router.activeTab;

  return (
    <nav className="no-select bg-card border-t border-line pb-safe">
      <div className="flex">
        {TABS.map((t) => {
          const on = t.name === active;
          return (
            <button
              key={t.name}
              type="button"
              className="tap flex-1 flex flex-col items-center justify-center gap-0.5 active:opacity-60"
              onClick={() => router.switchTab(t.name)}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  on ? 'bg-primary text-white' : 'bg-bg text-sub'
                }`}
              >
                {t.icon}
              </span>
              <span className={`text-xs ${on ? 'text-primary font-medium' : 'text-sub'}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** 供页面内需要切换 Tab 的场景复用 */
export function gotoTab(name: TabName): void {
  router.switchTab(name);
}

export { TAB_NAMES };
