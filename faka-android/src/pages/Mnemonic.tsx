import { useMemo, useState } from 'react';
import { router } from '../router/stack.ts';
import { MNEMONICS, getSubject } from '../core/catalog.ts';
import { LevelTag } from '../components/LevelTag.tsx';
import { CardTile } from '../components/CardTile.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { DISCLAIMER } from '../types/index.ts';
import { SUBJECTS } from '../../../shared/constants.js';

/**
 * 口诀 Tab 根（B-1，T05）：科目筛选（有数据的科目可选）+ 口诀列表 → 单卡背诵。
 */
export default function Mnemonic() {
  const [subject, setSubject] = useState<string>('all');

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of MNEMONICS) map[m.subject] = (map[m.subject] || 0) + 1;
    return map;
  }, []);

  const list = useMemo(
    () => (subject === 'all' ? MNEMONICS : MNEMONICS.filter((m) => m.subject === subject)),
    [subject]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tab 根页头部（无返回键） */}
      <div className="pt-safe no-select bg-card border-b border-line">
        <div className="px-4 pt-3 pb-2">
          <div className="text-2xl font-bold">口诀速记</div>
          <div className="text-xs text-sub mt-1">共 {MNEMONICS.length} 条 · 点卡片进入背诵</div>
        </div>
        {/* 科目筛选 chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          <button
            type="button"
            className={`shrink-0 tap min-h-8 px-3 rounded-full text-xs border ${
              subject === 'all' ? 'bg-primary text-white border-primary' : 'bg-card text-sub border-line'
            }`}
            onClick={() => setSubject('all')}
          >
            全部 {MNEMONICS.length}
          </button>
          {SUBJECTS.filter((s) => counts[s.id]).map((s) => (
            <button
              key={s.id}
              type="button"
              className={`shrink-0 tap min-h-8 px-3 rounded-full text-xs border ${
                subject === s.id ? 'bg-primary text-white border-primary' : 'bg-card text-sub border-line'
              }`}
              onClick={() => setSubject(s.id)}
            >
              {s.short} {counts[s.id]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {list.length === 0 && <EmptyState icon="🗣️" text="该科目口诀整理中" hint="当前版本先行覆盖刑事诉讼法" />}
        <div className="space-y-2">
          {list.map((m) => {
            const meta = getSubject(m.subject);
            return (
              <CardTile
                key={m.id}
                title={m.mnemonic}
                subtitle={m.scenario}
                level={m.level}
                color={meta?.color}
                tag={m.chapter}
                onClick={() => router.push('recite', { mode: 'single', id: m.id })}
              />
            );
          })}
        </div>
        <div className="text-xs text-sub/80 leading-relaxed mt-4 mb-4">{DISCLAIMER}</div>
      </div>
    </div>
  );
}

// LevelTag 保留引用：后续章节行内重要度标注
void LevelTag;
