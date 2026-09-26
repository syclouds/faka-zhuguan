import { useEffect, useRef, useState } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { getCaseById, getSubject, getQuestionType } from '../core/catalog.ts';
import { compoundId, caseStatusSummary } from '../core/cases.ts';
import type { CaseQuestion, QuestionType } from '../types/index.ts';
import { AppBar } from '../components/AppBar.tsx';
import { ClauseLink } from '../components/ClauseLink.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { toast } from '../utils/toast.ts';
import { DISCLAIMER } from '../types/index.ts';

/** qType → 中文短标签 */
const QTYPE_LABEL: Record<QuestionType, string> = {
  relief: '救济型',
  plan: '方案型',
  evaluate: '评价型',
  correct: '纠错型',
  essay: '论述型',
  open: '开放型'
};

/**
 * 案例详情（B-3，T05）：
 * 每问独立作答区：设问 + qType 标签（→设问答法高亮）+ 采分点逐条自评（踩中/没踩中 →
 * recordPoint 按 U-4 单采分点粒度记录）+ 参考答案折叠 + 草稿 500ms 防抖自动保存；
 * 底部「完成训练」→ finishCase（attempts+1 + miss 回流错题本）→ popTo('caseList')（路由栈规则 6）。
 */
export default function CaseDetail({ params }: { params: Record<string, string> }) {
  const caseCard = getCaseById(params.id || '');
  const caseRecords = useAppStore((s) => s.caseRecords);
  const recordPoint = useAppStore((s) => s.recordPoint);
  const finishCase = useAppStore((s) => s.finishCase);
  const saveDraft = useAppStore((s) => s.saveDraft);
  const drafts = useAppStore((s) => s.drafts);

  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [confirmFinish, setConfirmFinish] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // 卸载时清理全部草稿防抖定时器
  useEffect(() => {
    const map = timers.current;
    return () => {
      Object.values(map).forEach((t) => clearTimeout(t));
    };
  }, []);

  if (!caseCard) {
    return (
      <div className="h-full flex flex-col">
        <AppBar title="案例详情" back />
        <EmptyState icon="🫥" text="案例不存在" actionText="返回" onAction={() => router.pop()} />
      </div>
    );
  }

  const meta = getSubject(caseCard.subject);
  const rec = caseRecords[caseCard.id];

  /** 该采分点当前自评状态：true 踩中 / false 没踩中 / undefined 未评 */
  const pointState = (qid: string, spId: string): boolean | undefined => {
    if (!rec) return undefined;
    const cid = compoundId(caseCard.id, qid, spId);
    if (rec.hit.includes(cid)) return true;
    if (rec.miss.includes(cid)) return false;
    return undefined;
  };

  const onPoint = (qid: string, spId: string, hit: boolean) => {
    recordPoint(caseCard.id, qid, spId, hit);
  };

  const onDraft = (qid: string, text: string) => {
    if (timers.current[qid]) clearTimeout(timers.current[qid]);
    timers.current[qid] = setTimeout(() => saveDraft(qid, text), 500);
  };

  const onFinish = () => {
    finishCase(caseCard.id);
    setConfirmFinish(false);
    // store action 返回 void：完成后从最新 state 读取记录做结果提示
    const done = useAppStore.getState().caseRecords[caseCard.id];
    if (done && done.attempts > 0) {
      toast(
        `已完成：踩中率 ${Math.round(done.rate * 100)}%${done.miss.length > 0 ? `，${done.miss.length} 个采分点回流错题本` : ''}`,
        'success'
      );
    }
    // 路由栈规则 6：完成后回列表
    if (!router.popTo('caseList')) router.pop();
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar
        title={caseCard.title}
        subtitle={meta?.name}
        back
        right={<span className="text-xs text-sub pr-1">{caseStatusSummary(rec)}</span>}
      />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {/* 案情 */}
        <div className="card-box p-4">
          <div className="text-sm font-semibold mb-1.5">案情</div>
          <div className="selectable text-sm leading-relaxed">{caseCard.prompt}</div>
        </div>

        {/* 各设问 */}
        {caseCard.questions.map((q: CaseQuestion, qi) => {
          const qt = getQuestionType(q.qType || 'open');
          const open = showAnswer[q.qid];
          const draft = drafts[q.qid];
          return (
            <div key={q.qid} className="card-box p-4 mt-3">
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-primary shrink-0">第 {qi + 1} 问</span>
                <div className="selectable text-sm font-medium flex-1">{q.q}</div>
              </div>
              {qt && (
                <button
                  type="button"
                  className="no-select tap min-h-8 mt-2 inline-flex items-center rounded-full bg-primary-weak text-primary text-xs px-3 active:opacity-60"
                  onClick={() => router.push('questionTypes', { qType: (q.qType || 'open') as string })}
                >
                  答法：{QTYPE_LABEL[(q.qType || 'open') as QuestionType]} ›
                </button>
              )}

              {/* 采分点自评 */}
              <div className="mt-3 space-y-2">
                {q.scorePoints.map((sp) => {
                  const st = pointState(q.qid, sp.id);
                  return (
                    <div key={sp.id} className="rounded-xl border border-line px-3 py-2">
                      <div className="selectable text-sm font-medium">{sp.k}</div>
                      {sp.v && <div className="selectable text-xs text-sub mt-0.5">{sp.v}</div>}
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className={`tap min-h-9 flex-1 rounded-lg text-xs border ${
                            st === true ? 'bg-success text-white border-success' : 'bg-card text-sub border-line'
                          }`}
                          onClick={() => onPoint(q.qid, sp.id, true)}
                        >
                          ✓ 踩中
                        </button>
                        <button
                          type="button"
                          className={`tap min-h-9 flex-1 rounded-lg text-xs border ${
                            st === false ? 'bg-danger text-white border-danger' : 'bg-card text-sub border-line'
                          }`}
                          onClick={() => onPoint(q.qid, sp.id, false)}
                        >
                          ✗ 没踩中
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 参考答案（折叠） */}
              <button
                type="button"
                className="tap w-full mt-3 text-xs text-primary text-left active:opacity-60"
                onClick={() => setShowAnswer((p) => ({ ...p, [q.qid]: !open }))}
              >
                {open ? '收起参考答案 ▲' : '展开参考答案 ▼'}
              </button>
              {open && (
                <div className="selectable text-sm text-sub leading-relaxed mt-2 border-t border-line pt-2">
                  {q.answer}
                </div>
              )}

              {/* 本问法条 */}
              {q.clauseIndex && q.clauseIndex.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {q.clauseIndex.map((c) => (
                    <ClauseLink key={c} raw={c} small />
                  ))}
                </div>
              )}

              {/* 草稿 */}
              <textarea
                value={draft?.text || ''}
                placeholder="作答草稿（自动保存）…"
                className="tap w-full min-h-24 rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-primary selectable mt-3"
                onChange={(e) => onDraft(q.qid, e.target.value)}
              />
            </div>
          );
        })}

        <button type="button" className="btn-primary mt-4 h-12" onClick={() => setConfirmFinish(true)}>
          完成训练
        </button>
        <div className="text-xs text-sub mt-2 text-center">未踩中的采分点将自动回流错题本</div>
        <div className="text-xs text-sub/80 leading-relaxed mt-4 mb-6">{DISCLAIMER}</div>
      </div>

      <ConfirmDialog
        open={confirmFinish}
        title="完成本次训练？"
        content="将统计踩中率，未踩中的采分点回流错题本。"
        confirmText="完成"
        onConfirm={onFinish}
        onCancel={() => setConfirmFinish(false)}
      />
    </div>
  );
}
