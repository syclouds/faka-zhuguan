import { useState, type ReactNode } from 'react';
import { router } from '../router/stack.ts';
import {
  searchAll,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  type SearchResults
} from '../core/search.ts';
import { AppBar } from '../components/AppBar.tsx';
import { CardTile } from '../components/CardTile.tsx';
import { ClauseLink } from '../components/ClauseLink.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { toast } from '../utils/toast.ts';

const EMPTY: SearchResults = { kw: '', cards: [], mnemonics: [], cases: [], essays: [], clauses: [], clauseDirect: null };

/**
 * 全文检索（P9，T04）：法条号直达 + 五类分组结果 + 搜索历史（限 10 条，去重置顶）。
 */
export default function Search() {
  const [kw, setKw] = useState('');
  const [res, setRes] = useState<SearchResults | null>(null);
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());

  const run = (q: string) => {
    const query = q.trim();
    if (!query) {
      setRes(null);
      return;
    }
    setKw(query);
    const r = searchAll(query);
    setRes(r);
    setHistory([...addSearchHistory(query)]);
  };

  const go = {
    card: (id: string) => router.push('recite', { mode: 'single', id }),
    mnemonic: (id: string) => router.push('recite', { mode: 'single', id }),
    case: (id: string) => router.push('caseDetail', { id }),
    essay: (id: string) => router.push('essayDetail', { id })
  };

  const total = res ? res.cards.length + res.mnemonics.length + res.cases.length + res.essays.length + res.clauses.length : 0;

  return (
    <div className="h-full flex flex-col">
      <AppBar title="全文检索" back />
      {/* 搜索框 */}
      <div className="shrink-0 bg-card border-b border-line px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={kw}
            placeholder="搜考点 / 口诀 / 案例 / 论述，或直接输「刑诉法 16」"
            className="tap flex-1 rounded-xl bg-bg px-3 text-sm outline-none border border-line focus:border-primary"
            onChange={(e) => setKw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') run(kw);
            }}
          />
          <button type="button" className="btn-primary w-14 h-11 shrink-0" onClick={() => run(kw)}>
            搜
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {/* 未搜索：历史记录 */}
        {!res && (
          <>
            {history.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">搜索历史</span>
                  <button
                    type="button"
                    className="text-xs text-sub active:opacity-60"
                    onClick={() => {
                      clearSearchHistory();
                      setHistory([]);
                      toast('已清空历史', 'success');
                    }}
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className="no-select tap min-h-8 px-3 rounded-full bg-card border border-line text-xs active:bg-bg"
                      onClick={() => run(h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="🔍" text="输入关键词或法条号开始检索" hint="支持考点/口诀/案例/论述/法条五类" />
            )}
          </>
        )}

        {/* 无结果 */}
        {res && total === 0 && <EmptyState icon="🫥" text={`没有找到「${res.kw}」相关内容`} />}

        {/* 法条号直达 */}
        {res?.clauseDirect && (
          <div className="card-box p-4 mb-3">
            <div className="text-xs text-sub mb-2">法条直达</div>
            <ClauseLink code={res.clauseDirect.code} />
            <div className="text-xs text-sub mt-2">关联 {res.clauseDirect.refs.length} 张卡片/口诀/案例</div>
          </div>
        )}

        {/* 分组结果 */}
        {res && res.cards.length > 0 && (
          <Section title={`考点（${res.cards.length}）`}>
            {res.cards.map((c) => (
              <CardTile
                key={c.id}
                title={c.title}
                subtitle={c.core}
                level={c.level}
                color={c.subjectColor}
                tag={c.subjectShort}
                onClick={() => go.card(c.id)}
              />
            ))}
          </Section>
        )}
        {res && res.mnemonics.length > 0 && (
          <Section title={`口诀（${res.mnemonics.length}）`}>
            {res.mnemonics.map((m) => (
              <CardTile key={m.id} title={m.mnemonic} subtitle={m.scenario} level={m.level} tag="口诀" onClick={() => go.mnemonic(m.id)} />
            ))}
          </Section>
        )}
        {res && res.cases.length > 0 && (
          <Section title={`案例（${res.cases.length}）`}>
            {res.cases.map((c) => (
              <CardTile key={c.id} title={c.title} subtitle={c.prompt} level={c.level} tag={`${c.questions.length} 问`} onClick={() => go.case(c.id)} />
            ))}
          </Section>
        )}
        {res && res.essays.length > 0 && (
          <Section title={`论述模板（${res.essays.length}）`}>
            {res.essays.map((e) => (
              <CardTile key={e.id} title={e.title} subtitle={e.topic} level={e.level} tag="论述" onClick={() => go.essay(e.id)} />
            ))}
          </Section>
        )}
        {res && res.clauses.length > 0 && (
          <Section title={`法条（${res.clauses.length}）`}>
            <div className="flex flex-wrap gap-1.5">
              {res.clauses.map((c) => (
                <ClauseLink key={c.code} code={c.code} small />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
