import type { ReactNode } from 'react';

interface ProgressRingProps {
  /** 0–100 */
  percent: number;
  /** 像素直径（CSS 变量体系外，仅 SVG 内部用） */
  size?: number;
  stroke?: number;
  children?: ReactNode;
}

/** 环形进度（首页今日完成度）：SVG stroke-dasharray 实现，无需第三方库 */
export function ProgressRing({ percent, size = 96, stroke = 8, children }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (c * clamped) / 100;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--c-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
