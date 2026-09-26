import { useMemo } from 'react';
import { useRouterTick, masteryOf } from './Chapter.tsx';
import { useAppStore } from '../state/useAppStore.ts';
import { allRecitableItems, userCardsToItems, getSubjectsWithChapters } from '../core/catalog.ts';
import { buildTodayQueue, todayCount } from '../core/review.ts';
import { router } from '../router/stack.ts';
import { ProgressRing } from '../components/ProgressRing.tsx';
import { MasteryBar } from '../components/MasteryBar.tsx';
import { DISCLAIMER } from '../types/index.ts';

/**
 * 背诵台 Tab（T04）：今日队列总览 + 四种背诵入口 + 七科掌握度分布。
 */
export default function Review() {
  useRouterTick();
  const settings = useAppStore((s) => s.settings);
  const wrongList = useAppStore((s) => s.wrongList);
  const progress = useAppStore((s) => s.progress);

  const items = useMemo(() => allRecitableItems().concat(userCardsToItems()), []);
  const queue = useMemo(
    () => buildTodayQueue(items, { dailyNew: settings.dailyNew, dailyReview: settings.dailyReview }),
    [items, settings.dailyNew, settings.dailyReview]
  );

  const done = todayCount();
  const dailyTotal = settings.dailyNew + settings.dailyReview;
  const percent = dailyTotal > 0 ? Math.min(100, Math.round((done / dailyTotal) * 100)) : 0;

  const stats = masteryOf(progress, items.map((i) => i.id));

  const subjects = getSubjectsWithChapters();

  return (
    <div className="h-full overflow-auto no-scrollbar pt-safe">
      <div className="px-4 pt-4 pb-2">
        <div className="text-2xl font-bold">背诵台</div>
        <div className="text-xs text-sub mt-1">艾宾浩斯三档复习 · 到期自动排队</div>
      </div>

      {/* 今日任务卡 */}
      <div className="px-4">
        <div className="card-box p-4 flex items-center gap-4">
          <ProgressRing percent={percent}>
            <span className="text-xl font-bold">{done}</span>
            <span className="text-xs text-sub">已完成</span>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">今日待办 {queue.queue.length} 张</div>
            <div className="text-xs text-sub mt-1">
              复习 {queue.review.length} · 新学 {queue.fresh.length}（上限 {settings.dailyNew}）
            </div>
            <button
              type="button"
              className="btn-primary mt-3 h-11"
              onClick={() => router.push('recite', { mode: 'today' })}
            >
              {queue.queue.length > 0 ? '开始今日学习' : '已完成 · 再来一轮'}
            </button>
          </div>
        </div>
      </div>

      {/* 快捷背诵入口 */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-2">
        {[
          { icon: '⏰', label: `到期复习（${queue.review.length}）`, mode: 'due' },
          { icon: '✨', label: `只学新卡（${queue.fresh.length}）`, mode: 'new' },
          { icon: '📕', label: `错题重练（${wrongList.length}）`, mode: 'wrong' },
          { icon: '⭐', label: '收藏背诵', mode: 'fav' }
        ].map((e) => (
          <button
            key={e.mode}
            type="button"
            className="no-select tap card-box flex items-center gap-2 px-3 py-3 active:bg-bg"
            onClick={() => router.push('recite', { mode: e.mode })}
          >
            <span className="text-lg">{e.icon}</span>
            <span className="text-sm">{e.label}</span>
          </button>
        ))}
      </div>

      {/* 七科掌握度 */}
      <div className="px-4 mt-4">
        <div className="text-sm font-semibold mb-2">掌握度分布（总 {stats['-1'] + stats['0'] + stats['1'] + stats['2']} 项）</div>
        <div className="card-box p-4">
          <MasteryBar stats={stats} />
          <div className="mt-4 space-y-3">
            {subjects.map((s) => {
              const ids = s.cards.map((c) => c.id).concat(
                // 口诀计入科目分布
                []
              );
              const st = masteryOf(progress, ids);
              return (
                <button
                  key={s.id}
                  type="button"
                  className="no-select tap w-full text-left active:opacity-60"
                  onClick={() => router.push('chapter', { subject: s.id })}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-sub">
                      记住了 {st['2'] || 0}/{s.total}
                    </span>
                  </div>
                  <MasteryBar stats={st} total={s.total} compact />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 mb-6">
        <div className="text-xs text-sub/80 leading-relaxed">{DISCLAIMER}</div>
      </div>
    </div>
  );
}
