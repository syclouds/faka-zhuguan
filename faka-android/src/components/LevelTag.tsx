import type { Level } from '../types/index.ts';

interface LevelTagProps {
  level: Level;
  /** 小号用于行内 */
  small?: boolean;
}

const LEVEL_STYLE: Record<Level, { text: string; bg: string; label: string }> = {
  S: { text: 'text-danger', bg: 'bg-danger/10', label: 'S' },
  A: { text: 'text-warn', bg: 'bg-warn/10', label: 'A' },
  B: { text: 'text-primary', bg: 'bg-primary/10', label: 'B' },
  C: { text: 'text-sub', bg: 'bg-sub/10', label: 'C' }
};

/** 重要度标签：S 红 / A 橙 / B 蓝 / C 灰 */
export function LevelTag({ level, small }: LevelTagProps) {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.C;
  return (
    <span
      className={`no-select inline-flex items-center justify-center rounded-md font-bold ${s.text} ${s.bg} ${
        small ? 'w-4 h-4 text-xs' : 'w-6 h-6 text-sm'
      }`}
    >
      {s.label}
    </span>
  );
}
