interface EmptyStateProps {
  icon?: string;
  text: string;
  /** 次级说明 */
  hint?: string;
  actionText?: string;
  onAction?: () => void;
}

/** 空态占位（无错题 / 无收藏 / 搜索无结果等） */
export function EmptyState({ icon = '📭', text, hint, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="no-select flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-sm text-sub">{text}</div>
      {hint && <div className="text-xs text-sub/70 mt-1">{hint}</div>}
      {actionText && onAction && (
        <button type="button" className="btn-ghost mt-5 max-w-48" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
