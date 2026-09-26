import { useState } from 'react';
import { QUESTION_TYPES } from '../core/catalog.ts';
import { AppBar } from '../components/AppBar.tsx';
import { LevelTag } from '../components/LevelTag.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import type { QuestionType } from '../types/index.ts';

/**
 * 设问答法（B-4，T05）：六类模板；params.qType 高亮并默认展开（案例页「怎么答？」跳转）。
 */
export default function QuestionTypes({ params }: { params: Record<string, string> }) {
  const active = (params.qType || '') as QuestionType;
  const [openId, setOpenId] = useState<QuestionType | null>(active || null);

  return (
    <div className="h-full flex flex-col">
      <AppBar title="六类设问答法" subtitle="先辨题型，再套结构" back />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {QUESTION_TYPES.length === 0 && <EmptyState icon="📋" text="设问模板整理中" />}
        {QUESTION_TYPES.map((t, i) => {
          const open = openId === t.id;
          const highlighted = active === t.id;
          return (
            <div key={t.id} className={`card-box mb-3 overflow-hidden ${highlighted ? 'border-primary' : ''}`}>
              <button
                type="button"
                className="tap w-full px-4 py-3 flex items-center gap-2 text-left active:bg-bg no-select"
                onClick={() => setOpenId(open ? null : t.id)}
              >
                <span className="w-6 h-6 rounded-lg bg-primary-weak text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-medium text-sm flex-1">{t.name}</span>
                {highlighted && <span className="text-xs text-primary">本题类型</span>}
                <span className="text-sub text-xs">{open ? '▲' : '▼'}</span>
              </button>
              {open && (
                <div className="px-4 pb-4 border-t border-line pt-3">
                  <div className="text-xs text-sub">
                    <span className="font-medium text-ink">识别特征：</span>
                    {t.signal}
                  </div>
                  <div className="text-xs text-sub mt-1.5">
                    <span className="font-medium text-ink">示例：</span>
                    {t.example}
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-1.5">标准答法结构</div>
                    <ol className="space-y-1.5">
                      {t.structure.map((s, j) => (
                        <li key={j} className="selectable text-sm text-sub flex gap-2">
                          <span className="text-primary font-bold shrink-0">{j + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="mt-3 rounded-lg bg-danger/10 px-3 py-2">
                    <div className="text-xs font-medium text-danger mb-0.5">常见失分</div>
                    <div className="selectable text-xs text-sub">{t.trap}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// LevelTag 引用保留（模板重要度扩展位）
void LevelTag;
