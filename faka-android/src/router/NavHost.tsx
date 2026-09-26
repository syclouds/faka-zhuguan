/**
 * NavHost：渲染各 Tab 独立页面栈（ARCH §6.2）
 * - 4 个 Tab 容器常驻挂载（切 Tab 不丢栈内实例与滚动位置），非激活 Tab display:none；
 * - 栈内页面全部挂载，仅栈顶可见（返回后上一页立即可见且保留状态）；
 * - 新入栈页面播放右滑转场（page-enter）；
 * - 浏览器/PWA 场景注册 popstate → router.onPopState()（navSource 去重在栈内核完成）。
 */
import { useEffect, useSyncExternalStore, createElement } from 'react';
import { router, TAB_NAMES, type TabName } from './stack.ts';
import { PAGE_MAP } from './pageMap.ts';

export function NavHost() {
  useSyncExternalStore(
    (cb) => router.subscribe(cb),
    () => router.version
  );

  // popstate 同步（仅浏览器环境；Capacitor 原生返回键走 useBackButton）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPop = () => router.onPopState();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden">
      {TAB_NAMES.map((tab: TabName) => {
        const stack = router.stacks[tab];
        const active = tab === router.activeTab;
        return (
          <div
            key={tab}
            className="absolute inset-0"
            style={{ display: active ? 'block' : 'none' }}
          >
            {stack.map((entry, i) => {
              const isTop = i === stack.length - 1;
              const PageComp = PAGE_MAP[entry.name];
              return (
                <div
                  key={entry.key}
                  className={`absolute inset-0 bg-bg ${isTop ? 'page-enter' : 'hidden'}`}
                >
                  {createElement(PageComp, { params: entry.params })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
