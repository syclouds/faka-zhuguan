import type { ReactNode } from 'react';
import { router } from '../router/stack.ts';

interface AppBarProps {
  title: string;
  /** 显示返回箭头（Tab 根页不显示） */
  back?: boolean;
  /** 副标题（路由参数说明等） */
  subtitle?: string;
  /** 右侧动作区（收藏按钮等） */
  right?: ReactNode;
}

/**
 * 顶部导航栏（A-2）：56dp 高 + 状态栏安全区；返回箭头走 router.pop()。
 */
export function AppBar({ title, back, subtitle, right }: AppBarProps) {
  return (
    <div className="pt-safe no-select bg-card border-b border-line">
      <div className="h-14 flex items-center px-2 gap-1">
        {back && (
          <button
            type="button"
            aria-label="返回"
            className="tap min-w-12 rounded-xl flex items-center justify-center text-ink active:opacity-60"
            onClick={() => router.pop()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0 px-1">
          <div className="text-lg font-semibold truncate">{title}</div>
          {subtitle && <div className="text-xs text-sub truncate">{subtitle}</div>}
        </div>
        {right && <div className="flex items-center pr-1">{right}</div>}
      </div>
    </div>
  );
}
