import { useState } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import type { Level, Point } from '../types/index.ts';
import { AppBar } from '../components/AppBar.tsx';
import { Sheet } from '../components/Sheet.tsx';
import { LevelTag } from '../components/LevelTag.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { toast } from '../utils/toast.ts';

interface FormState {
  title: string;
  chapter: string;
  level: Level;
  core: string;
  points: Point[];
}

const EMPTY_FORM: FormState = { title: '', chapter: '', level: 'A', core: '', points: [{ k: '', v: '' }] };

/**
 * 自建考点（T05）：列表 + 新建/编辑（Sheet 表单）。
 * 存储 UserCard（LegacyCard 形状 + source:'user'），进入背诵走 resolveReviewItem。
 */
export default function UserCards() {
  const userCards = useAppStore((s) => s.userCards);
  const addUserCard = useAppStore((s) => s.addUserCard);
  const removeUserCard = useAppStore((s) => s.removeUserCard);

  const [form, setForm] = useState<FormState | null>(null);

  const save = () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast('请填写考点标题', 'error');
      return;
    }
    const points = form.points.filter((p) => p.k.trim() !== '');
    if (points.length === 0) {
      toast('至少填写一个采分点关键词', 'error');
      return;
    }
    addUserCard({
      id: `user-${Date.now()}`,
      chapter: form.chapter.trim() || '自建',
      title: form.title.trim(),
      level: form.level,
      core: form.core.trim(),
      points,
      clauses: [],
      trick: ''
    });
    toast('已保存，可在背诵与搜索中使用', 'success');
    setForm(null);
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar
        title="自建考点"
        subtitle={`${userCards.length} 条`}
        back
        right={
          <button
            type="button"
            className="tap min-w-12 text-primary text-sm font-medium flex items-center justify-center active:opacity-60"
            onClick={() => setForm({ ...EMPTY_FORM, points: [{ k: '', v: '' }] })}
          >
            ＋新建
          </button>
        }
      />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {userCards.length === 0 && (
          <EmptyState
            icon="✏️"
            text="还没有自建考点"
            hint="整理自己的易错点，与内置考点一样参与背诵队列与错题本"
            actionText="新建第一个考点"
            onAction={() => setForm({ ...EMPTY_FORM, points: [{ k: '', v: '' }] })}
          />
        )}
        <div className="space-y-2">
          {userCards.map((c) => (
            <div key={c.id} className="card-box px-4 py-3">
              <div className="flex items-center gap-2">
                <LevelTag level={c.level} small />
                <span className="text-sm font-medium flex-1 truncate">{c.title}</span>
                <button
                  type="button"
                  className="tap min-w-10 text-xs text-primary active:opacity-60"
                  onClick={() => router.push('recite', { mode: 'single', id: c.id })}
                >
                  背诵
                </button>
                <button
                  type="button"
                  className="tap min-w-10 text-xs text-danger active:opacity-60"
                  onClick={() => {
                    removeUserCard(c.id);
                    toast('已删除', 'success');
                  }}
                >
                  删除
                </button>
              </div>
              <div className="text-xs text-sub mt-1 truncate">
                {c.chapter} · {c.core || `${c.points.length} 个采分点`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 新建表单 */}
      <Sheet open={form !== null} onClose={() => setForm(null)} title="新建考点">
        {form && (
          <div className="pb-2">
            <input
              type="text"
              value={form.title}
              placeholder="考点标题（必填）"
              className="tap w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-primary mb-2"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              type="text"
              value={form.chapter}
              placeholder="章节（默认「自建」）"
              className="tap w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-primary mb-2"
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
            />
            <div className="flex gap-1.5 mb-2">
              {(['S', 'A', 'B', 'C'] as Level[]).map((lv) => (
                <button
                  key={lv}
                  type="button"
                  className={`tap min-h-9 flex-1 rounded-lg text-xs border ${
                    form.level === lv ? 'bg-primary text-white border-primary' : 'bg-card text-sub border-line'
                  }`}
                  onClick={() => setForm({ ...form, level: lv })}
                >
                  {lv}
                </button>
              ))}
            </div>
            <textarea
              value={form.core}
              placeholder="核心句（背诵卡正面副标题）"
              className="tap w-full min-h-16 rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary mb-2"
              onChange={(e) => setForm({ ...form, core: e.target.value })}
            />
            <div className="text-sm font-semibold mb-1">采分点（至少 1 个）</div>
            {form.points.map((p, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  value={p.k}
                  placeholder="关键词（默写挖空）"
                  className="tap w-32 rounded-lg border border-line bg-bg px-2 text-sm outline-none focus:border-primary"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      points: form.points.map((q, j) => (j === i ? { ...q, k: e.target.value } : q))
                    })
                  }
                />
                <input
                  type="text"
                  value={p.v}
                  placeholder="展开说明（可选）"
                  className="tap flex-1 rounded-lg border border-line bg-bg px-2 text-sm outline-none focus:border-primary"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      points: form.points.map((q, j) => (j === i ? { ...q, v: e.target.value } : q))
                    })
                  }
                />
                <button
                  type="button"
                  className="tap min-w-9 text-sub rounded-lg border border-line"
                  onClick={() => setForm({ ...form, points: form.points.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-primary py-1 active:opacity-60"
              onClick={() => setForm({ ...form, points: [...form.points, { k: '', v: '' }] })}
            >
              ＋添加采分点
            </button>
            <button type="button" className="btn-primary mt-3 h-11" onClick={save}>
              保存
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
