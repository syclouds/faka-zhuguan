import { useEffect, useRef } from 'react';
import type { BlankState } from '../types/index.ts';

interface BlankInputProps {
  blank: BlankState;
  index: number;
  showTip: boolean;
  disabled: boolean;
  autoFocus?: boolean;
  onChange: (index: number, value: string) => void;
  onFocusState?: (focused: boolean) => void;
}

/**
 * 默写挖空输入行（A-7）：展示关键词提示（可选）→ 输入框 → 校验后红绿描边。
 * 受控组件，状态由 Recite 页持有。
 */
export function BlankInput({ blank, index, showTip, disabled, autoFocus, onChange, onFocusState }: BlankInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current && !disabled) {
      // 延迟聚焦，避免键盘弹起打断转场
      const t = setTimeout(() => ref.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [autoFocus, disabled]);

  const border = blank.checked ? (blank.right ? 'border-success' : 'border-danger') : 'border-line';

  return (
    <div className="selectable py-1.5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-sub shrink-0">{index + 1}.</span>
        {showTip ? (
          <span className="text-sm font-medium">{blank.k}</span>
        ) : (
          <span className="text-sm text-sub">{`共 ${blank.k.length} 个关键词`}</span>
        )}
        {blank.checked && (
          <span className={`text-xs font-medium ${blank.right ? 'text-success' : 'text-danger'}`}>
            {blank.right ? '✓ 命中' : '✗ 未命中'}
          </span>
        )}
      </div>
      <input
        ref={ref}
        type="text"
        value={blank.input}
        disabled={disabled}
        placeholder="默写关键词…"
        className={`tap w-full rounded-xl border ${border} bg-card px-3 text-sm outline-none focus:border-primary`}
        onChange={(e) => onChange(index, e.target.value)}
        onFocus={() => onFocusState?.(true)}
        onBlur={() => onFocusState?.(false)}
      />
    </div>
  );
}
