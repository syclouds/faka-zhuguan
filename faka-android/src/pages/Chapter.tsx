import { useMemo, useSyncExternalStore } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { getSubject, getSubjectsWithChapters } from '../core/catalog.ts';
import { dueLabel } from '../utils/date.ts';
import { AppBar } from '../components/AppBar.tsx';
import { LevelTag } from '../components/LevelTag.tsx';
import { MasteryBar } from '../components/MasteryBar.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { DISCLAIMER } from '../types/index.ts';

/** 页面公共：订阅路由版本（返回本页时刷新进度显示） */
export function useRouterTick(): number {
  return useSyncExternalStore(
    (cb) => router.subscribe(cb),
    () => router.version
  );
}

/** 由 store.progress 计算一组卡 id 的掌握度分布 */
export function masteryOf(progress: Record<string, { level: number }>, ids: string[]): Record<string, number> {
  const stats: Record<string, number> = { '-1': 0, '0': 0, '1': 0, '2': 0 };
  for (const id of ids) {
    const lv = progress[id]?.level;
    const key = lv === undefined || lv === null ? '-1' : String(lv);
    stats[key] = (stats[key] || 0) + 1;
  }
  return stats;
}

/**
 * 章节背诵页（T04）：无 subject 参数 → 七科列表（含掌握度）；有 subject → 章节列表。
 * 点击章节 → recite { mode:'chapter', subject, chapterIndex }。
 */
export default function Chapter({ params }: { params: Record<string, string> }) {
  useRouterTick();
  const progress = useAppStore((s) => s.progress);
  const subjectId = params.subject || '';

  const subject = subjectId ? getSubject(subjectId) : null;
  const groups = useMemo(() => getSubjectsWithChapters(), []);

  /* ---------- 二级：章节列表 ---------- */
  if (subject) {
    const group = groups.find((g) => g.id === subject.id);
    const chapters = group?.chapters || [];
    return (
      <div className="h-full flex flex-col">
        <AppBar title={subject.name} subtitle={`${group?.total || 0} 个考点`} back />
        <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
          {chapters.length === 0 && <EmptyState icon="📂" text="该科目暂无章节数据" />}
          {chapters.map((ch, idx) => {
            const stats = masteryOf(progress, ch.ids);
            return (
              <button
                key={ch.name}
                type="button"
                className="no-select tap w-full card-box px-4 py-3 mb-2 text-left active:bg-bg"
                onClick={() =>
                  router.push('recite', {
                    mode: 'chapter',
                    subject: subject.id,
                    chapterIndex: String(idx)
                  })
                }
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm flex-1 truncate">{ch.name}</span>
                  {ch.sCount > 0 && <LevelTag level="S" small />}
                  <span className="text-xs text-sub">{ch.count} 卡</span>
                  <span className="text-sub">›</span>
                </div>
                <div className="mt-2">
                  <MasteryBar stats={stats} total={ch.count} compact />
                </div>
              </button>
            );
          })}
          <div className="text-xs text-sub/80 leading-relaxed mt-4 mb-4">{DISCLAIMER}</div>
        </div>
      </div>
    );
  }

  /* ---------- 一级：科目列表 ---------- */
  return (
    <div className="h-full flex flex-col">
      <AppBar title="章节背诵" subtitle="选择科目进入章节" />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {groups.map((g) => {
          const allIds = g.cards.map((c) => c.id);
          const stats = masteryOf(progress, allIds);
          // 最近到期日（展示用，取已学卡最小 due）
          const dues = g.cards
            .map((c) => progress[c.id]?.due || 0)
            .filter((d) => d > 0)
            .sort((a, b) => a - b);
          return (
            <button
              key={g.id}
              type="button"
              className="no-select tap w-full card-box px-4 py-3 mb-2 text-left active:bg-bg"
              onClick={() => router.push('chapter', { subject: g.id })}
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: g.color }}>
                  {g.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{g.name}</div>
                  <div className="text-xs text-sub mt-0.5">
                    {g.total} 卡 · {dues.length > 0 ? `最近到期 ${dueLabel(dues[0])}` : '未开始'}
                  </div>
                </div>
                <span className="text-sub">›</span>
              </div>
              <div className="mt-2">
                <MasteryBar stats={stats} total={g.total} compact />
              </div>
            </button>
          );
        })}
        <div className="text-xs text-sub/80 leading-relaxed mt-4 mb-4">{DISCLAIMER}</div>
      </div>
    </div>
  );
}
