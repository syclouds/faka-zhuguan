import { useMemo, useState } from 'react';
import { router } from '../router/stack.ts';
import { findClauseByInput, normalizeClause } from '../core/clause.ts';
import { CLAUSE_INDEX, resolveReviewItem } from '../core/catalog.ts';
import type { ClauseEntry } from '../types/index.ts';
import { AppBar } from '../components/AppBar.tsx';
import { EmptyState } from '../components/EmptyState.tsx';

/**
 * 法条速查（B-2，T05）：输入归一化直达（'刑诉法 16'/'第十六条'）+ 关键词过滤 + 反查关联
 * 考点/口诀（→单卡背诵）与案例（→案例详情）双向跳转。
 */
export default function Clause({ params }: { params: Record<string, string> }) {
  const [kw, setKw] = useState<string>(() => params.code || '');
  const [openCode, setOpenCode] = useState<string | null>(() => params.code || null);

  const direct = useMemo(() => findClauseByInput(kw), [kw]);

  const list = useMemo((): ClauseEntry[] => {
    const q = kw.trim().toLowerCase();
    if (direct) return [direct];
    if (!q) return [];
    return CLAUSE_INDEX.filter(
      (e) => e.label.toLowerCase().includes(q) || e.law.includes(kw.trim()) || e.article.includes(kw.trim())
    ).slice(0, 40);
  }, [kw, direct]);

  /** ref id → 跳转（case- 前缀 = 案例卡，其余走 ReviewItem 解析） */
  const gotoRef = (ref: string) => {
    if (ref.startsWith('case-')) {
      router.push('caseDetail', { id: ref });
      return;
    }
    const item = resolveReviewItem(ref);
    if (item) router.push('recite', { mode: 'single', id: ref });
    else if (ref.startsWith('essay-')) router.push('essayDetail', { id: ref });
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar title="法条速查" subtitle={`共 ${CLAUSE_INDEX.length} 条结构化法条`} back />
      <div className="shrink-0 bg-card border-b border-line px-4 py-2">
        <input
          type="search"
          value={kw}
          placeholder="如：刑诉法 16 / 第十六条 / 民法典"
          className="tap w-full rounded-xl bg-bg border border-line px-3 text-sm outline-none focus:border-primary"
          onChange={(e) => setKw(e.target.value)}
        />
        {kw.trim() && !direct && normalizeClause(kw) === null && (
          <div className="text-xs text-sub mt-1.5">提示：按「法名 条号」输入可直达；当前为关键词过滤</div>
        )}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {list.length === 0 && (
          <EmptyState
            icon="📖"
            text={kw.trim() ? '没有匹配的法条' : '输入法条号或法名开始查询'}
            hint="数据来源于本 App 全部考点的法条索引"
          />
        )}
        <div className="space-y-2">
          {list.map((e) => {
            const open = openCode === e.code;
            return (
              <div key={e.code} className="card-box overflow-hidden">
                <button
                  type="button"
                  className="tap w-full px-4 py-3 flex items-center text-left active:bg-bg no-select"
                  onClick={() => setOpenCode(open ? null : e.code)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{e.label}</div>
                    <div className="text-xs text-sub mt-0.5">关联 {e.refs.length} 张卡片/口诀/案例</div>
                  </div>
                  <span className="text-sub text-xs">{open ? '▲' : '▼'}</span>
                </button>
                {open && (
                  <div className="border-t border-line px-4 py-3">
                    {e.refs.length === 0 ? (
                      <div className="text-xs text-sub">暂无关联内容</div>
                    ) : (
                      <div className="space-y-1.5">
                        {e.refs.map((ref) => {
                          const item = resolveReviewItem(ref);
                          const title = item ? item.primary : ref.startsWith('case-') ? '案例训练' : ref;
                          return (
                            <button
                              key={ref}
                              type="button"
                              className="tap w-full min-h-10 flex items-center gap-2 text-left active:bg-bg rounded-lg no-select"
                              onClick={() => gotoRef(ref)}
                            >
                              <span className="text-xs px-1.5 py-0.5 rounded bg-primary-weak text-primary shrink-0">
                                {ref.startsWith('case-') ? '案例' : item?.kind === 'mnemonic' ? '口诀' : '考点'}
                              </span>
                              <span className="text-sm truncate flex-1">{title}</span>
                              <span className="text-sub">›</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
