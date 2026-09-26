import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import {
  allRecitableItems,
  userCardsToItems,
  cardToItem,
  getCardsByChapterId
} from '../core/catalog.ts';
import { dueCards, newCards, buildTodayQueue, isFavorite } from '../core/review.ts';
import { judgeHit } from '../core/judge.ts';
import type { BlankState, ReviewItem } from '../types/index.ts';
import { AppBar } from '../components/AppBar.tsx';
import { LevelTag } from '../components/LevelTag.tsx';
import { PointRow } from '../components/PointRow.tsx';
import { ClauseLink } from '../components/ClauseLink.tsx';
import { BlankInput } from '../components/BlankInput.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { toast } from '../utils/toast.ts';
import { getSubject } from '../core/catalog.ts';

type Mode = 'today' | 'due' | 'new' | 'chapter' | 'wrong' | 'fav' | 'single';
type Phase = 'front' | 'blank' | 'result' | 'done';

const MODE_TITLE: Record<Mode, string> = {
  today: '今日学习',
  due: '到期复习',
  new: '学习新卡',
  chapter: '章节背诵',
  wrong: '错题重练',
  fav: '收藏背诵',
  single: '卡片背诵'
};

function buildQueue(
  mode: Mode,
  params: Record<string, string>,
  dailyNew: number,
  dailyReview: number,
  wrongList: string[],
  favIds: string[]
): ReviewItem[] {
  const base = allRecitableItems().concat(userCardsToItems());
  const byId = new Map(base.map((it) => [it.id, it]));
  switch (mode) {
    case 'today':
      // 引擎队列：到期复习优先 + 按重要度补新卡（与小程序 buildQueue 等价，含洗牌）
      return buildTodayQueue(base, { dailyNew, dailyReview }).queue;
    case 'due':
      return dueCards(base);
    case 'new':
      return newCards(base).slice(0, dailyNew);
    case 'chapter': {
      const subject = params.subject || '';
      const idx = Number(params.chapterIndex || '0');
      return getCardsByChapterId(subject, idx).cards.map(cardToItem);
    }
    case 'wrong':
      return wrongList
        .map((id) => byId.get(id) || null)
        .filter((it): it is ReviewItem => it !== null);
    case 'fav':
      return favIds
        .map((id) => byId.get(id) || null)
        .filter((it): it is ReviewItem => it !== null);
    case 'single': {
      const id = params.id || '';
      const found = byId.get(id);
      return found ? [found] : [];
    }
    default:
      return [];
  }
}

/**
 * 背诵页（T04 核心，ARCH §5.3）：
 * 三态状态机 front（展示）→ blank（默写挖空）→ result（对照）→ done（队列完成）；
 * 关键词校验走 judgeHit（与小程序等价：去空白双向 includes + 60% 长度兜底）；
 * 三档评按钮常驻底部（没记住/模糊/记住了 → markLevel 0/1/2）；
 * 双卡种：考点卡与口诀卡统一按 ReviewItem 渲染（primary/secondary/points/clauses）；
 * 返回拦截：默写中先收键盘，再弹二次确认，确认后放行退出。
 */
export default function Recite({ params }: { params: Record<string, string> }) {
  const settings = useAppStore((s) => s.settings);
  const wrongList = useAppStore((s) => s.wrongList);
  const favorites = useAppStore((s) => s.favorites);

  const mode = (['today', 'due', 'new', 'chapter', 'wrong', 'fav', 'single'].includes(params.mode || '')
    ? params.mode
    : 'today') as Mode;

  // 队列只在进入页面时构建一次（标记动作不改变队列，只更新进度）
  const [queue] = useState<ReviewItem[]>(() =>
    buildQueue(
      mode,
      params,
      settings.dailyNew,
      settings.dailyReview,
      wrongList,
      favorites.filter((f) => f.kind === 'card' || f.kind === 'mnemonic').map((f) => f.id)
    )
  );

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('front');
  const [blanks, setBlanks] = useState<BlankState[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [favTick, setFavTick] = useState(0);

  const markLevel = useAppStore((s) => s.markLevel);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  const current = queue[idx];
  const subjectMeta = current ? getSubject(current.subject) : null;
  const fav = current ? isFavorite(current.id) : false;
  void favTick;

  /* ---------- 返回拦截（leaveGuard） ---------- */
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const focusedRef = useRef(inputFocused);
  focusedRef.current = inputFocused;
  const confirmRef = useRef(confirmExit);
  confirmRef.current = confirmExit;
  const offGuardRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const off = router.setLeaveGuard(() => {
      // 完成页 / 首卡展示态 → 不拦截
      if (phaseRef.current === 'done') return false;
      if (phaseRef.current === 'front' && idxRef.current === 0) return false;
      // 输入中：第一次返回收键盘
      if (focusedRef.current) {
        (document.activeElement as HTMLElement | null)?.blur?.();
        toast('已收起键盘，再按返回确认退出', 'info');
        setInputFocused(false);
        return true;
      }
      // 弹二次确认（若已弹出保持消费）
      if (!confirmRef.current) setConfirmExit(true);
      return true;
    });
    offGuardRef.current = off;
    return off;
  }, []);

  const doExit = useCallback(() => {
    setConfirmExit(false);
    // 先注销守卫再 pop，避免 pop 被 guard 消费
    offGuardRef.current?.();
    offGuardRef.current = null;
    router.pop();
  }, []);

  /* ---------- 默写动作 ---------- */
  const startBlank = () => {
    if (!current) return;
    setBlanks(
      (current.points || []).map((p) => ({ k: p.k, input: '', checked: false, right: false }))
    );
    setPhase('blank');
  };

  const peekAnswer = () => setPhase('result');

  const changeBlank = (i: number, v: string) => {
    setBlanks((prev) => prev.map((b, j) => (j === i ? { ...b, input: v } : b)));
  };

  const checkBlanks = () => {
    setBlanks((prev) =>
      prev.map((b) => ({ ...b, checked: true, right: b.input.replace(/\s/g, '') !== '' && judgeHit(b.input, b.k) }))
    );
    setPhase('result');
  };

  /* ---------- 三档评分 ---------- */
  const rate = (level: 0 | 1 | 2) => {
    if (!current) return;
    markLevel(current.id, level);
    if (idx + 1 >= queue.length) {
      setPhase('done');
    } else {
      setIdx(idx + 1);
      setPhase('front');
      setBlanks([]);
    }
  };

  const restart = () => {
    setIdx(0);
    setPhase('front');
    setBlanks([]);
  };

  /* ---------- 渲染 ---------- */
  if (queue.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <AppBar title={MODE_TITLE[mode]} back />
        <div className="flex-1">
          <EmptyState
            icon="🎉"
            text={mode === 'wrong' ? '错题本空空如也' : mode === 'due' ? '今日没有到期复习' : '暂无可背诵内容'}
            actionText="返回"
            onAction={() => router.pop()}
          />
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="h-full flex flex-col">
        <AppBar title={MODE_TITLE[mode]} back />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="text-5xl mb-4">🏅</div>
          <div className="text-xl font-bold">本轮完成</div>
          <div className="text-sm text-sub mt-2">共背诵 {queue.length} 张 · 已按记忆曲线安排下次复习</div>
          <div className="flex gap-3 mt-8 w-full max-w-72">
            <button type="button" className="btn-ghost flex-1" onClick={restart}>
              再来一轮
            </button>
            <button type="button" className="btn-primary flex-1" onClick={doExit}>
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressText = `${idx + 1}/${queue.length}`;

  return (
    <div className="h-full flex flex-col">
      <AppBar
        title={`${MODE_TITLE[mode]} · ${progressText}`}
        subtitle={subjectMeta ? subjectMeta.name : current?.subject === 'user' ? '自建考点' : ''}
        back
        right={
          current && (
            <button
              type="button"
              aria-label="收藏"
              className="tap min-w-10 flex items-center justify-center text-xl active:opacity-60"
              onClick={() => {
                toggleFavorite(current.id, current.kind, current.primary);
                setFavTick((t) => t + 1);
                toast(isFavorite(current.id) ? '已收藏' : '已取消收藏', 'success');
              }}
            >
              {fav ? '⭐' : '☆'}
            </button>
          )
        }
      />

      {/* 卡片区 */}
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-4">
        {current && (
          <>
            {/* 正面：primary 大字（口诀 = 口诀短句，考点 = 标题） */}
            <div className="card-box p-4">
              <div className="flex items-center gap-2 mb-2">
                <LevelTag level={current.level} small />
                <span className="text-xs text-sub">{current.chapter}</span>
                {current.kind === 'mnemonic' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary-weak text-primary">口诀</span>
                )}
              </div>
              <div className="selectable text-2xl font-bold leading-snug">{current.primary}</div>
              {current.secondary && <div className="selectable text-sm text-sub mt-2">{current.secondary}</div>}
            </div>

            {/* 默写态：挖空输入 */}
            {phase === 'blank' && (
              <div className="card-box p-4 mt-3">
                <div className="text-sm font-semibold mb-1">默写关键词</div>
                {settings.showKeywordTip ? null : (
                  <div className="text-xs text-sub mb-1">关键词提示已关闭（设置中可开启）</div>
                )}
                {blanks.map((b, i) => (
                  <BlankInput
                    key={`${current.id}-${i}`}
                    blank={b}
                    index={i}
                    showTip={settings.showKeywordTip}
                    disabled={false}
                    autoFocus={i === 0}
                    onChange={changeBlank}
                    onFocusState={setInputFocused}
                  />
                ))}
              </div>
            )}

            {/* 对照态：全部采分点 */}
            {phase === 'result' && (
              <div className="card-box p-4 mt-3">
                <div className="text-sm font-semibold mb-2">
                  {blanks.length > 0 && blanks[0].checked ? '对照结果' : '参考展开'}
                </div>
                <div className="space-y-1">
                  {(current.points || []).map((p, i) => {
                    const b = blanks[i];
                    const status = b && b.checked ? (b.right ? 'right' : 'wrong') : 'none';
                    return <PointRow key={i} point={p} index={i + 1} status={status} />;
                  })}
                </div>
                {current.clauses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {current.clauses.map((c, i) => (
                      <ClauseLink key={i} raw={c} small />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 底部操作区（三档评常驻） */}
      <div className="shrink-0 bg-card border-t border-line pb-safe">
        <div className="px-4 py-3">
          {phase === 'front' && (
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={peekAnswer}>
                直接看答案
              </button>
              <button type="button" className="btn-primary flex-1" onClick={startBlank}>
                开始默写
              </button>
            </div>
          )}
          {phase === 'blank' && (
            <button type="button" className="btn-primary" onClick={checkBlanks}>
              校验答案
            </button>
          )}
          {phase === 'result' && (
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-ghost flex-1 bg-danger/10 border-danger/30 text-danger"
                onClick={() => rate(0)}
              >
                没记住
              </button>
              <button
                type="button"
                className="btn-ghost flex-1 bg-warn/10 border-warn/30 text-warn"
                onClick={() => rate(1)}
              >
                模糊
              </button>
              <button
                type="button"
                className="btn-ghost flex-1 bg-success/10 border-success/30 text-success"
                onClick={() => rate(2)}
              >
                记住了
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 退出二次确认 */}
      <ConfirmDialog
        open={confirmExit}
        title="退出本次背诵？"
        content="进度已按记忆曲线保存，可直接退出。"
        confirmText="退出"
        cancelText="继续背诵"
        onConfirm={doExit}
        onCancel={() => setConfirmExit(false)}
      />
    </div>
  );
}
