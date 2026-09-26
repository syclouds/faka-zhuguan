import { useEffect, useRef, useState } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { getEssayById } from '../core/catalog.ts';
import { isFavorite } from '../core/review.ts';
import { AppBar } from '../components/AppBar.tsx';
import { LevelTag } from '../components/LevelTag.tsx';
import { PointRow } from '../components/PointRow.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { toast } from '../utils/toast.ts';
import { DISCLAIMER } from '../types/index.ts';

/**
 * 论述详情（T04）：框架/金句/填充/范文/避坑 + 练习草稿（500ms 防抖自动保存）。
 * 草稿 key = essay-<id>（DraftMap 契约）。
 */
export default function EssayDetail({ params }: { params: Record<string, string> }) {
  const essay = getEssayById(params.id || '');
  const saveDraft = useAppStore((s) => s.saveDraft);
  const drafts = useAppStore((s) => s.drafts);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const favorites = useAppStore((s) => s.favorites);

  const draftKey = `essay-${params.id || ''}`;
  const [text, setText] = useState<string>(() => drafts[draftKey]?.text || '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(drafts[draftKey]?.text || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  if (!essay) {
    return (
      <div className="h-full flex flex-col">
        <AppBar title="论述详情" back />
        <EmptyState icon="🫥" text="模板不存在或已被移除" actionText="返回" onAction={() => router.pop()} />
      </div>
    );
  }

  const fav = isFavorite(essay.id);

  const onChangeText = (v: string) => {
    setText(v);
    // 500ms 防抖自动保存草稿
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDraft(draftKey, v), 500);
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar
        title={essay.title}
        back
        right={
          <button
            type="button"
            aria-label="收藏"
            className="tap min-w-10 flex items-center justify-center text-xl active:opacity-60"
            onClick={() => {
              const on = toggleFavorite(essay.id, 'essay', essay.title);
              toast(on ? '已收藏' : '已取消收藏', 'success');
            }}
          >
            {fav ? '⭐' : '☆'}
          </button>
        }
      />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {/* 头部 */}
        <div className="flex items-center gap-2 mb-3">
          <LevelTag level={essay.level} small />
          <span className="text-xs text-sub">{essay.topic}</span>
        </div>

        {/* 写作框架 */}
        <div className="card-box p-4">
          <div className="text-sm font-semibold mb-2">写作框架</div>
          <div className="space-y-1">
            {essay.frame.map((f, i) => (
              <PointRow key={i} point={f} index={i + 1} />
            ))}
          </div>
        </div>

        {/* 金句 */}
        {essay.phrases.length > 0 && (
          <div className="card-box p-4 mt-3">
            <div className="text-sm font-semibold mb-2">高分金句</div>
            <div className="space-y-1.5">
              {essay.phrases.map((p, i) => (
                <div key={i} className="selectable text-sm bg-primary-weak text-primary rounded-lg px-3 py-2">
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 填充要点 */}
        {essay.fill.length > 0 && (
          <div className="card-box p-4 mt-3">
            <div className="text-sm font-semibold mb-2">填充要点</div>
            <ul className="space-y-1">
              {essay.fill.map((f, i) => (
                <li key={i} className="selectable text-sm text-sub list-disc list-inside">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 参考范文 */}
        {essay.sample && (
          <div className="card-box p-4 mt-3">
            <div className="text-sm font-semibold mb-2">参考范文</div>
            <div className="selectable text-sm leading-relaxed whitespace-pre-wrap">{essay.sample}</div>
          </div>
        )}

        {/* 避坑 */}
        {essay.trap && (
          <div className="card-box p-4 mt-3 border-l-2 border-l-danger">
            <div className="text-sm font-semibold mb-1 text-danger">避坑提示</div>
            <div className="selectable text-sm text-sub">{essay.trap}</div>
          </div>
        )}

        {/* 练习草稿（防抖自动保存） */}
        <div className="card-box p-4 mt-3">
          <div className="text-sm font-semibold mb-1">练习区（自动保存草稿）</div>
          <textarea
            value={text}
            placeholder="在此练习本篇论述，内容自动保存…"
            className="tap w-full min-h-40 rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary selectable"
            onChange={(e) => onChangeText(e.target.value)}
          />
          <div className="text-xs text-sub mt-1">
            {drafts[draftKey] ? `上次保存：${new Date(drafts[draftKey].updatedAt).toLocaleString()}` : '尚未保存过草稿'}
          </div>
        </div>

        <div className="text-xs text-sub/80 leading-relaxed mt-4 mb-4">{DISCLAIMER}</div>
      </div>
    </div>
  );
}
