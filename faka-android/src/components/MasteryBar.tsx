interface MasteryBarProps {
  /** 掌握度分布：key '-1' 未学 / '0' 没记住 / '1' 模糊 / '2' 记住了 */
  stats: Record<string, number>;
  /** 总数（分母；缺省取 stats 各项之和） */
  total?: number;
  /** 紧凑模式（章节行内） */
  compact?: boolean;
}

const SEGMENTS: { key: string; color: string; label: string }[] = [
  { key: '2', color: 'bg-success', label: '记住了' },
  { key: '1', color: 'bg-warn', label: '模糊' },
  { key: '0', color: 'bg-danger', label: '没记住' },
  { key: '-1', color: 'bg-line', label: '未学' }
];

/** 掌握度分布条（A-6）：四段横向占比 + 图例 */
export function MasteryBar({ stats, total, compact }: MasteryBarProps) {
  const sum = total ?? SEGMENTS.reduce((acc, s) => acc + (stats[s.key] || 0), 0);
  return (
    <div className="no-select w-full">
      <div className={`w-full flex rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2.5'} bg-line`}>
        {SEGMENTS.map((s) => {
          const n = stats[s.key] || 0;
          if (n <= 0) return null;
          return <div key={s.key} className={s.color} style={{ width: `${(n / sum) * 100}%` }} />;
        })}
      </div>
      {!compact && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-sub">
          {SEGMENTS.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1">
              <span className={`inline-block w-2 h-2 rounded-full ${s.color}`} />
              {s.label} {stats[s.key] || 0}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
