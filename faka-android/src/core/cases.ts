/**
 * 案例训练自评与错题回流（B-3，ARCH §5.2）
 * U-4 裁决：错题本粒度 = 单个采分点，复合 id 格式 caseId#qid#spId。
 */
import type { CaseCard, CaseQuestion, CaseRecord } from '../types/index.ts';
import { get, set } from './store.ts';
import { touchStat } from './review.ts';
import { getCaseById } from './catalog.ts';

/** 案例采分点复合 id：'case-civ-001#q1#sp-2' */
export function compoundId(caseId: string, qid: string, spId: string): string {
  return `${caseId}#${qid}#${spId}`;
}

/** 解析复合 id；非案例格式返回 null */
export function parseWrongRef(ref: string): { caseId: string; qid: string; spId: string } | null {
  const parts = (ref || '').split('#');
  if (parts.length !== 3 || !parts[0].startsWith('case-')) return null;
  return { caseId: parts[0], qid: parts[1], spId: parts[2] };
}

export function getCaseRecords(): Record<string, CaseRecord> {
  return get<Record<string, CaseRecord>>('caseRecords', {}) || {};
}

function writeRecords(records: Record<string, CaseRecord>): void {
  set('caseRecords', records);
}

/** 记录单个采分点自评结果（答到/没答到可反复修改，实时算踩中率） */
export function recordPoint(caseId: string, qid: string, spId: string, hit: boolean): CaseRecord {
  const records = getCaseRecords();
  const rec: CaseRecord = records[caseId] || {
    caseId,
    attempts: 0,
    lastAt: 0,
    hit: [],
    miss: [],
    rate: 0
  };
  const cid = compoundId(caseId, qid, spId);
  const hitSet = new Set(rec.hit);
  const missSet = new Set(rec.miss);
  if (hit) {
    hitSet.add(cid);
    missSet.delete(cid);
  } else {
    missSet.add(cid);
    hitSet.delete(cid);
  }
  rec.hit = Array.from(hitSet);
  rec.miss = Array.from(missSet);
  const scored = rec.hit.length + rec.miss.length;
  rec.rate = scored === 0 ? 0 : rec.hit.length / scored;
  records[caseId] = rec;
  writeRecords(records);
  return rec;
}

/** 完成本案例全部自评：attempts+1、未答到采分点回流错题本、计入学习统计 */
export function finishCase(caseId: string): CaseRecord | null {
  const records = getCaseRecords();
  const rec = records[caseId];
  if (!rec) return null;
  rec.attempts += 1;
  rec.lastAt = Date.now();
  records[caseId] = rec;
  writeRecords(records);

  // 未答到 → 错题本（U-4 单采分点粒度）
  if (rec.miss.length > 0) {
    const wrongList = get<string[]>('wrongList', []) || [];
    let changed = false;
    for (const ref of rec.miss) {
      if (wrongList.indexOf(ref) === -1) {
        wrongList.push(ref);
        changed = true;
      }
    }
    if (changed) set('wrongList', wrongList);
  }

  touchStat(1);
  return rec;
}

/** 全部重新自评（重做一轮：清空 hit/miss，attempts 保留） */
export function resetCaseProgress(caseId: string): void {
  const records = getCaseRecords();
  const rec = records[caseId];
  if (!rec) return;
  rec.hit = [];
  rec.miss = [];
  rec.rate = 0;
  records[caseId] = rec;
  writeRecords(records);
}

/** 案例完成状态摘要（列表页展示：未做过 / 做过 N 轮 · 踩中率 x%） */
export function caseStatusSummary(rec: CaseRecord | undefined): string {
  if (!rec || rec.attempts === 0) return '未做过';
  return `做过 ${rec.attempts} 轮 · 踩中率 ${Math.round(rec.rate * 100)}%`;
}

/** 错题本案例回流项 → 定位到具体案例/设问/采分点（WrongBook 展示用） */
export function resolveWrongCaseRef(ref: string): {
  caseCard: CaseCard;
  question: CaseQuestion;
  spId: string;
} | null {
  const parsed = parseWrongRef(ref);
  if (!parsed) return null;
  const caseCard = getCaseById(parsed.caseId);
  if (!caseCard) return null;
  const question = caseCard.questions.find((q) => q.qid === `${parsed.caseId}-${parsed.qid}` || q.qid === parsed.qid);
  if (!question) return null;
  return { caseCard, question, spId: parsed.spId };
}
