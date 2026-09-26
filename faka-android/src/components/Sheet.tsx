import type { ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** 底部弹层（A-8）：遮罩点击关闭 + sheet-up 转场 + 手势条安全区 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="sheet-in absolute left-0 right-0 bottom-0 bg-card rounded-t-2xl pb-safe max-h-[80%] flex flex-col">
        <div className="pt-safe shrink-0" />
        {title && (
          <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0">
            <span className="font-semibold">{title}</span>
            <button
              type="button"
              aria-label="关闭"
              className="tap min-w-10 text-sub flex items-center justify-center active:opacity-60"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}
        <div className="overflow-auto no-scrollbar px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}
