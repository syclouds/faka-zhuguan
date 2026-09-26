import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { AppBar } from '../components/AppBar.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { toast } from '../utils/toast.ts';
import type { FavKind } from '../types/index.ts';

const KIND_ICON: Record<FavKind, string> = {
  card: '📚',
  mnemonic: '🗣️',
  case: '⚖️',
  essay: '📝'
};

/**
 * 收藏（T05）：四类收藏统一列表；点击跳转对应页面；星标切换移除。
 */
export default function Favorites() {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const goto = (kind: FavKind, id: string) => {
    switch (kind) {
      case 'card':
      case 'mnemonic':
        router.push('recite', { mode: 'single', id });
        break;
      case 'case':
        router.push('caseDetail', { id });
        break;
      case 'essay':
        router.push('essayDetail', { id });
        break;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar title="我的收藏" subtitle={`${favorites.length} 条`} back />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {favorites.length === 0 && (
          <EmptyState icon="⭐" text="还没有收藏" hint="背诵卡、口诀、案例、论述模板均可收藏" />
        )}
        <div className="card-box overflow-hidden">
          {favorites.map((f) => (
            <div key={`${f.kind}-${f.id}`} className="border-b border-line last:border-b-0">
              <button type="button" className="cell py-3 gap-3" onClick={() => goto(f.kind, f.id)}>
                <span className="text-lg w-8 text-center">{KIND_ICON[f.kind]}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">{f.title || f.id}</span>
                  <span className="text-xs text-sub block mt-0.5">
                    {new Date(f.at).toLocaleDateString()} · 点击查看
                  </span>
                </span>
                <span className="text-sub">›</span>
              </button>
              <button
                type="button"
                className="tap w-full text-xs text-sub text-right px-4 pb-2 active:opacity-60"
                onClick={() => {
                  toggleFavorite(f.id, f.kind, f.title);
                  toast('已取消收藏', 'success');
                }}
              >
                取消收藏
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
