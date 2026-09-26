import type { Point } from '../types/index.ts';

interface PointRowProps {
  point: Point;
  /** 序号（从 1 起） */
  index?: number;
  /** 校验状态：默写对照后显示对错色 */
  status?: 'none' | 'right' | 'wrong';
}

/** 采分点行（背诵对照/卡片详情通用）：关键词加粗，展开说明次级色，正文可长按复制 */
export function PointRow({ point, index, status = 'none' }: PointRowProps) {
  const border =
    status === 'right' ? 'border-l-success' : status === 'wrong' ? 'border-l-danger' : 'border-l-line';
  return (
    <div className={`selectable border-l-2 ${border} pl-3 py-1.5`}>
      <div className="text-sm font-medium flex items-start gap-1.5">
        {index !== undefined && <span className="text-sub shrink-0">{index}.</span>}
        <span>{point.k}</span>
      </div>
      {point.v && <div className="text-sm text-sub mt-0.5">{point.v}</div>}
    </div>
  );
}
