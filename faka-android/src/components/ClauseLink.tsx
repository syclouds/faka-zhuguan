import { normalizeClause, clauseLabel } from '../core/clause.ts';
import { router } from '../router/stack.ts';

interface ClauseLinkProps {
  /** 已归一化 code（'刑事诉讼法|16'）；与 raw 二选一 */
  code?: string;
  /** 原始法条字符串（数据里的自由文本，组件内部尝试归一化） */
  raw?: string;
  small?: boolean;
}

/**
 * 法条链接 chip（B-2）：可归一化 → 可点击跳法条速查；
 * 不可归一化（描述性文本）→ 纯展示（保留在卡片内）。
 */
export function ClauseLink({ code, raw, small }: ClauseLinkProps) {
  const resolved = code || (raw ? normalizeClause(raw) : null);
  const label = resolved ? clauseLabel(resolved) : raw || '';

  if (!label) return null;

  if (!resolved) {
    return <span className="inline-block text-xs text-sub bg-bg rounded-md px-2 py-1">{label}</span>;
  }

  return (
    <button
      type="button"
      className={`no-select tap inline-flex items-center rounded-md bg-primary-weak text-primary active:opacity-60 ${
        small ? 'text-xs px-2 min-h-6' : 'text-xs px-2.5 min-h-8'
      }`}
      onClick={() => router.push('clause', { code: resolved })}
    >
      📖 {label}
    </button>
  );
}
