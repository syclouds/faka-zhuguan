interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 居中确认弹窗（返回拦截二次确认 / 清空数据确认等） */
export function ConfirmDialog({
  open,
  title,
  content,
  confirmText = '确定',
  cancelText = '取消',
  danger,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-80 card-box p-5 no-select">
        <div className="font-semibold text-base text-center">{title}</div>
        {content && <div className="text-sm text-sub mt-2 text-center">{content}</div>}
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn-primary flex-1 ${danger ? 'bg-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
