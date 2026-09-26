import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { getCatalogStats } from '../core/catalog.ts';
import { APP_VERSION } from '../types/index.ts';

interface CellDef {
  icon: string;
  label: string;
  badge?: number;
  route: Parameters<typeof router.push>[0];
  desc?: string;
}

/**
 * 我的 Tab 根（T05）：学习总览 + 功能入口（错题/收藏/自建/案例/答法/法条）+ 设置/关于。
 */
export default function Mine() {
  const stats = useAppStore((s) => s.stats);
  const wrongList = useAppStore((s) => s.wrongList);
  const favorites = useAppStore((s) => s.favorites);
  const userCards = useAppStore((s) => s.userCards);
  const stat = getCatalogStats();

  const cells: CellDef[] = [
    { icon: '📕', label: '错题本', badge: wrongList.length, route: 'wrongBook', desc: '没记住的自动回流' },
    { icon: '⭐', label: '我的收藏', badge: favorites.length, route: 'favorites' },
    { icon: '✏️', label: '自建考点', badge: userCards.length, route: 'userCards' },
    { icon: '⚖️', label: '案例训练', route: 'caseList', desc: `${stat.totalCases} 案 ${stat.totalQuestions} 问` },
    { icon: '📋', label: '六类设问答法', route: 'questionTypes' },
    { icon: '📖', label: '法条速查', route: 'clause' },
    { icon: '💾', label: '备份与恢复', route: 'settings', desc: '导出 / 导入全部学习数据（在设置页）' },
    { icon: '⚙️', label: '设置', route: 'settings' },
    { icon: 'ℹ️', label: '关于与免责声明', route: 'about' }
  ];

  return (
    <div className="h-full overflow-auto no-scrollbar pt-safe">
      {/* 头部总览 */}
      <div className="px-4 pt-5 pb-4">
        <div className="text-2xl font-bold">我的</div>
        <div className="card-box mt-3 p-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-primary">{stats.totalCards || 0}</div>
            <div className="text-xs text-sub mt-0.5">累计背诵</div>
          </div>
          <div>
            <div className="text-xl font-bold text-warn">{stats.streak || 0}</div>
            <div className="text-xs text-sub mt-0.5">连续打卡（天）</div>
          </div>
          <div>
            <div className="text-xl font-bold text-success">{stat.totalCards}</div>
            <div className="text-xs text-sub mt-0.5">考点库总量</div>
          </div>
        </div>
      </div>

      {/* 功能入口 */}
      <div className="px-4">
        <div className="card-box overflow-hidden">
          {cells.map((c) => (
            <button
              key={c.label}
              type="button"
              className="cell py-3 gap-3"
              onClick={() => router.push(c.route)}
            >
              <span className="text-lg w-8 text-center">{c.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{c.label}</span>
                {c.desc && <span className="text-xs text-sub block mt-0.5">{c.desc}</span>}
              </span>
              {typeof c.badge === 'number' && c.badge > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-danger text-white text-xs flex items-center justify-center">
                  {c.badge > 99 ? '99+' : c.badge}
                </span>
              )}
              <span className="text-sub">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 text-center text-xs text-sub">版本 {APP_VERSION} · 数据完全本地存储</div>
    </div>
  );
}
