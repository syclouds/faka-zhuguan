import { useMemo, useSyncExternalStore } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import {
  allRecitableItems,
  getSubjectsWithChapters,
  getCatalogStats,
  userCardsToItems
} from '../core/catalog.ts';
import { buildTodayQueue, todayCount } from '../core/review.ts';
import { SUBJECTS } from '../../../shared/constants.js';
import { DISCLAIMER } from '../types/index.ts';
import { ProgressRing } from '../components/ProgressRing.tsx';
import { CardTile } from '../components/CardTile.tsx';
import { daysUntil } from '../utils/date.ts';

/** 订阅路由版本：从背诵页返回首页时自动刷新统计 */
function useRouterVersion(): number {
  return useSyncExternalStore(
    (cb) => router.subscribe(cb),
    () => router.version
  );
}

/**
 * 首页（T04）：今日进度环 + 考试倒计时 + 快捷入口 + 科目网格 + 免责声明（合规三处之一）。
 */
export default function Home() {
  useRouterVersion();
  const settings = useAppStore((s) => s.settings);
  const stats = useAppStore((s) => s.stats);

  const items = useMemo(() => allRecitableItems().concat(userCardsToItems()), []);
  const queue = useMemo(
    () =>
      buildTodayQueue(items, { dailyNew: settings.dailyNew, dailyReview: settings.dailyReview }),
    [items, settings.dailyNew, settings.dailyReview]
  );

  const done = todayCount();
  const dailyTotal = settings.dailyNew + settings.dailyReview;
  const percent = dailyTotal > 0 ? Math.round((done / dailyTotal) * 100) : 0;
  const stat = getCatalogStats();
  const examDays = settings.examDate > 0 ? daysUntil(settings.examDate) : null;

  return (
    <div className="h-full overflow-auto no-scrollbar pt-safe">
      {/* 顶部问候 + 考试倒计时 */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">法考主观题速记</div>
          <div className="text-xs text-sub mt-1">
            {examDays !== null ? `距考试还有 ${examDays} 天` : '尚未设置考试日期（以司法部官方公告为准）'}
          </div>
        </div>
        <button
          type="button"
          className="tap min-w-12 rounded-xl bg-primary-weak text-primary text-xs px-3 flex items-center active:opacity-60"
          onClick={() => router.push('settings')}
        >
          {examDays !== null ? '修改' : '设置日期'}
        </button>
      </div>

      {/* 今日进度卡 */}
      <div className="px-4">
        <div className="card-box p-4 flex items-center gap-4">
          <ProgressRing percent={percent}>
            <span className="text-xl font-bold">{percent}%</span>
            <span className="text-xs text-sub">今日</span>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">今日待办 {queue.queue.length} 张</div>
            <div className="text-xs text-sub mt-1">
              到期复习 {queue.review.length} · 新学 {queue.fresh.length}
            </div>
            <div className="text-xs text-sub mt-1">
              已完成 {done} · 连续打卡 {stats.streak || 0} 天
            </div>
            <button
              type="button"
              className="btn-primary mt-3 h-11"
              onClick={() => router.push('recite', { mode: 'today' })}
            >
              {queue.queue.length > 0 ? '开始今日学习' : '今日任务已完成 · 再来一轮'}
            </button>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="px-4 mt-4 grid grid-cols-4 gap-2">
        {[
          { icon: '📚', label: '章节背诵', route: 'chapter' as const, params: {} },
          { icon: '🔍', label: '搜索', route: 'search' as const, params: {} },
          { icon: '📝', label: '论述模板', route: 'essayList' as const, params: {} },
          { icon: '⚖️', label: '案例训练', route: 'caseList' as const, params: {} }
        ].map((e) => (
          <button
            key={e.label}
            type="button"
            className="no-select tap card-box flex flex-col items-center justify-center gap-1.5 active:bg-bg"
            onClick={() => router.push(e.route, e.params)}
          >
            <span className="text-xl">{e.icon}</span>
            <span className="text-xs">{e.label}</span>
          </button>
        ))}
      </div>

      {/* 科目网格 */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">科目（{stat.totalCards} 考点 · {stat.totalMnemonics} 口诀）</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {getSubjectsWithChapters().map((s) => (
            <CardTile
              key={s.id}
              title={s.name}
              subtitle={s.desc}
              color={s.color}
              tag={`${s.total} 卡`}
              onClick={() => router.push('chapter', { subject: s.id })}
            />
          ))}
        </div>
      </div>

      {/* 掌握度提示（跳转背诵台查看分布） */}
      <div className="px-4 mt-4">
        <button
          type="button"
          className="no-select tap w-full card-box px-4 py-3 flex items-center justify-between active:bg-bg"
          onClick={() => router.switchTab('review')}
        >
          <span className="text-sm">查看掌握度分布与错题</span>
          <span className="text-sub">›</span>
        </button>
      </div>

      {/* 科目图例 */}
      <div className="px-4 mt-3 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <span
            key={s.id}
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: `${s.color}1a`, color: s.color }}
          >
            {s.short}
          </span>
        ))}
      </div>

      {/* 免责声明（合规三处之一） */}
      <div className="px-4 mt-5 mb-6">
        <div className="text-xs text-sub/80 leading-relaxed">{DISCLAIMER}</div>
      </div>
    </div>
  );
}
