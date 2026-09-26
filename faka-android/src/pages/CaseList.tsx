import { useMemo, useState } from 'react';
import { router } from '../router/stack.ts';
import { CASES, getSubject } from '../core/catalog.ts';
import { caseStatusSummary } from '../core/cases.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { CardTile } from '../components/CardTile.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { DISCLAIMER } from '../types/index.ts';
import { SUBJECTS } from '../../../shared/constants.js';

/**
 * 案例训练列表（B-3，T05）：科目筛选 + 案例卡（做题轮次/踩中率）。
 */
export default function CaseList() {
  const caseRecords = useAppStore((s) => s.caseRecords);
  const [subject, setSubject] = useState<string>('all');

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of CASES) map[c.subject] = (map[c.subject] || 0) + 1;
    return map;
  }, []);

  const list = useMemo(
    () => (subject === 'all' ? CASES : CASES.filter((c) => c.subject === subject)),
    [subject]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="pt-safe no-select bg-card border-b border-line">
        <div className="px-4 pt-3 pb-2">
          <div className="text-2xl font-bold">案例训练</div>
          <div className="text-xs text-sub mt-1">
            {CASES.length} 案 · {CASES.reduce((a, c) => a + c.questions.length, 0)} 问 · 逐采分点自评
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          <button
            type="button"
            className={`shrink-0 tap min-h-8 px-3 rounded-full text-xs border ${
              subject === 'all' ? 'bg-primary text-white border-primary' : 'bg-card text-sub border-line'
            }`}
            onClick={() => setSubject('all')}
          >
            全部 {CASES.length}
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
        {list.length === 0 && <EmptyState icon="⚖️" text="该科目案例整理中" />}
        <div className="space-y-2">
          {list.map((c) => {
            const meta = getSubject(c.subject);
            const rec = caseRecords[c.id];
            return (
              <CardTile
                key={c.id}
                title={c.title}
                subtitle={c.prompt}
                level={c.level}
                color={meta?.color}
                tag={`${c.questions.length} 问`}
                meta={caseStatusSummary(rec)}
                onClick={() => router.push('caseDetail', { id: c.id })}
              />
            );
          })}
        </div>
        <div className="text-xs text-sub/80 leading-relaxed mt-4 mb-4">{DISCLAIMER}</div>
      </div>
    </div>
  );
}
