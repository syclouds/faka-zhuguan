import { useState } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { resolveReviewItem } from '../core/catalog.ts';
import { resolveWrongCaseRef } from '../core/cases.ts';
import { AppBar } from '../components/AppBar.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { toast } from '../utils/toast.ts';

/**
 * 错题本（T05）：U-4 单采分点粒度。
 * - 考点/口诀 ref（纯 id）→ 单卡重练 / 移除；
 * - 案例 ref（caseId#qid#spId 复合编码）→ 定位案例详情重练 / 移除。
 * 顶部「全部重练」→ recite { mode:'wrong' }。
 */
export default function WrongBook() {
  const wrongList = useAppStore((s) => s.wrongList);
  const removeWrong = useAppStore((s) => s.removeWrong);
  const [confirmClear, setConfirmClear] = useState<number>(-1); // 被请求移除的 ref 下标

  const plainRefs = wrongList.filter((r) => !r.includes('#'));
  const caseRefs = wrongList.filter((r) => r.includes('#'));

  const titleOf = (ref: string): string => {
    if (ref.includes('#')) {
      const resolved = resolveWrongCaseRef(ref);
      return resolved ? `${resolved.caseCard.title} · ${resolved.question.q}` : ref;
    }
    const item = resolveReviewItem(ref);
    return item ? item.primary : ref;
  };

  const goto = (ref: string) => {
    if (ref.includes('#')) {
      const resolved = resolveWrongCaseRef(ref);
      if (resolved) router.push('caseDetail', { id: resolved.caseCard.id });
      else toast('原案例已不存在，已移除该条目', 'error');
      return;
    }
    router.push('recite', { mode: 'single', id: ref });
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar title="错题本" subtitle={`${wrongList.length} 条待重练`} back />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {wrongList.length === 0 && (
          <EmptyState icon="🎉" text="错题本空空如也" hint="背诵中标记「没记住」或案例自评未踩中会自动进入这里" />
        )}

        {wrongList.length > 0 && (
          <button type="button" className="btn-primary h-11 mb-4" onClick={() => router.push('recite', { mode: 'wrong' })}>
            全部重练（{wrongList.length}）
          </button>
        )}

        {/* 案例采分点回流（复合 ref） */}
        {caseRefs.length > 0 && (
          <>
            <div className="text-sm font-semibold mb-2">案例采分点（{caseRefs.length}）</div>
            <div className="card-box overflow-hidden mb-4">
              {caseRefs.map((ref) => (
                <div key={ref} className="border-b border-line last:border-b-0">
                  <button type="button" className="cell py-3 gap-3" onClick={() => goto(ref)}>
                    <span className="text-lg w-8 text-center">⚖️</span>
                    <span className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{titleOf(ref)}</span>
                      <span className="text-xs text-sub block mt-0.5">点击去重练该案例</span>
                    </span>
                    <span className="text-sub">›</span>
                  </button>
                  <button
                    type="button"
                    className="tap w-full text-xs text-sub text-right px-4 pb-2 active:opacity-60"
                    onClick={() => {
                      removeWrong(ref);
                      toast('已从错题本移除', 'success');
                    }}
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 考点/口诀 */}
        {plainRefs.length > 0 && (
          <>
            <div className="text-sm font-semibold mb-2">考点 / 口诀（{plainRefs.length}）</div>
            <div className="card-box overflow-hidden">
              {plainRefs.map((ref) => (
                <button
                  key={ref}
                  type="button"
                  className="cell py-3 gap-3"
                  onClick={() => goto(ref)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setConfirmClear(wrongList.indexOf(ref));
                  }}
                >
                  <span className="text-lg w-8 text-center">
                    {resolveReviewItem(ref)?.kind === 'mnemonic' ? '🗣️' : '📚'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{titleOf(ref)}</span>
                    <span className="text-xs text-sub block mt-0.5">点击重练 · 长按（右键）移除</span>
                  </span>
                  <span className="text-sub">›</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear >= 0}
        title="移除该错题？"
        content="移除后下次标记「没记住」会重新进入错题本。"
        confirmText="移除"
        onConfirm={() => {
          if (confirmClear >= 0) removeWrong(wrongList[confirmClear]);
          setConfirmClear(-1);
          toast('已移除', 'success');
        }}
        onCancel={() => setConfirmClear(-1)}
      />
    </div>
  );
}
