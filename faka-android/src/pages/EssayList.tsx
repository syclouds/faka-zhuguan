import { useMemo } from 'react';
import { router } from '../router/stack.ts';
import { ESSAYS, ESSAY_TOPICS } from '../core/catalog.ts';
import { AppBar } from '../components/AppBar.tsx';
import { CardTile } from '../components/CardTile.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { DISCLAIMER } from '../types/index.ts';

/**
 * 论述模板列表（T04）：按 topic 分组展示全部模板。
 */
export default function EssayList() {
  const groups = useMemo(
    () =>
      ESSAY_TOPICS.map((topic) => ({
        topic,
        list: ESSAYS.filter((e) => e.topic === topic)
      })),
    []
  );

  return (
    <div className="h-full flex flex-col">
      <AppBar title="论述模板" subtitle={`${ESSAYS.length} 篇 · 第一题大作文`} back />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {groups.length === 0 && <EmptyState icon="📝" text="论述模板整理中" />}
        {groups.map((g) => (
          <div key={g.topic} className="mb-4">
            <div className="text-sm font-semibold mb-2">{g.topic}</div>
            <div className="space-y-2">
              {g.list.map((e) => (
                <CardTile
                  key={e.id}
                  title={e.title}
                  subtitle={e.frame.map((f) => f.k).join(' → ')}
                  level={e.level}
                  tag="模板"
                  onClick={() => router.push('essayDetail', { id: e.id })}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="text-xs text-sub/80 leading-relaxed mt-2 mb-4">{DISCLAIMER}</div>
      </div>
    </div>
  );
}
