import type { ReactNode } from 'react';
import type { Level } from '../types/index.ts';
import { LevelTag } from './LevelTag.tsx';

interface CardTileProps {
  title: string;
  /** 副标题（core / scenario / 案情摘要） */
  subtitle?: string;
  level?: Level;
  /** 左侧科目色条 */
  color?: string;
  /** 右上角小标签（科目短名 / 卡种） */
  tag?: string;
  /** 底部元信息（进度/到期等） */
  meta?: ReactNode;
  onClick?: () => void;
}

/** 通用列表卡块（A-4）：左侧色条 + 标题 + 副标题；≥48dp；按压反馈 */
export function CardTile({ title, subtitle, level, color, tag, meta, onClick }: CardTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="no-select tap w-full text-left card-box px-4 py-3 flex items-start gap-3 active:bg-bg"
    >
      {color && <span className="w-1 self-stretch rounded-full shrink-0" style={{ background: color }} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {level && <LevelTag level={level} small />}
          <span className="font-medium text-sm truncate flex-1">{title}</span>
          {tag && <span className="text-xs text-sub shrink-0">{tag}</span>}
        </div>
        {subtitle && <div className="text-xs text-sub mt-1 line-clamp-2">{subtitle}</div>}
        {meta && <div className="text-xs text-sub mt-1.5">{meta}</div>}
      </div>
    </button>
  );
}
