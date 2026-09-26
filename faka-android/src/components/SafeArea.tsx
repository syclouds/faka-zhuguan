import type { ReactNode } from 'react';

interface SafeAreaProps {
  /** 顶部状态栏安全区垫高 */
  top?: boolean;
  /** 底部手势条安全区垫高 */
  bottom?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * 安全区容器（§9.5）：env() 优先，useSafeArea 探针兜底写回根变量。
 */
export function SafeArea({ top, bottom, className = '', children }: SafeAreaProps) {
  return (
    <div className={`${top ? 'pt-safe' : ''} ${bottom ? 'pb-safe' : ''} ${className}`}>{children}</div>
  );
}
