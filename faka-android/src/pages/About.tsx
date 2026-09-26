import { useState } from 'react';
import { useAppStore } from '../state/useAppStore.ts';
import { APP_VERSION, DISCLAIMER } from '../types/index.ts';
import { AppBar } from '../components/AppBar.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { toast } from '../utils/toast.ts';
import { getCatalogStats } from '../core/catalog.ts';

/**
 * 关于与免责声明（T05）：版本信息 + 合规声明（DISCLAIMER 三处出现之一）+ 数据来源 + 重置数据。
 */
export default function About() {
  const resetAll = useAppStore((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);
  const stat = getCatalogStats();

  return (
    <div className="h-full flex flex-col">
      <AppBar title="关于与免责声明" back />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {/* 应用信息 */}
        <div className="card-box p-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex flex-col items-center justify-center gap-1.5 py-3.5">
            <span className="block w-8 h-0.5 bg-white rounded-full" />
            <span className="block w-8 h-0.5 bg-white rounded-full" />
            <span className="block w-8 h-0.5 bg-white rounded-full" />
          </div>
          <div className="text-lg font-bold mt-3">法考主观题速记</div>
          <div className="text-xs text-sub mt-1">版本 {APP_VERSION}（Android / PWA）</div>
          <div className="text-xs text-sub mt-0.5">
            考点 {stat.totalCards} · 口诀 {stat.totalMnemonics} · 案例 {stat.totalCases} · 模板 {stat.totalEssay}
          </div>
        </div>

        {/* 免责声明（合规） */}
        <div className="card-box p-4 mt-3">
          <div className="text-sm font-semibold mb-2">免责声明</div>
          <div className="selectable text-sm text-sub leading-relaxed">{DISCLAIMER}</div>
        </div>

        {/* 数据说明 */}
        <div className="card-box p-4 mt-3">
          <div className="text-sm font-semibold mb-2">内容与数据说明</div>
          <ul className="text-sm text-sub space-y-1.5 list-disc list-inside selectable">
            <li>全部背诵内容依据 2026 年公开备考资料与现行有效法律法规自行整理，非官方发布。</li>
            <li>法条号为客观条文序号；法条原文请以国家法律法规数据库官方文本为准。</li>
            <li>学习进度、错题本、收藏、草稿等数据仅存储在本机（本地持久化），不上传任何服务器。</li>
            <li>复习算法为艾宾浩斯遗忘曲线三档简化实现（0/1/2 三级自评）。</li>
          </ul>
        </div>

        {/* 危险区 */}
        <div className="card-box p-4 mt-3 border-danger/40">
          <div className="text-sm font-semibold text-danger mb-1">重置全部数据</div>
          <div className="text-xs text-sub mb-3">清空学习进度、错题本、收藏、案例记录与统计（不影响自建考点与备份文件）。</div>
          <button
            type="button"
            className="btn-primary bg-danger"
            onClick={() => setConfirmReset(true)}
          >
            重置数据
          </button>
        </div>

        <div className="h-6" />
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="确认重置？"
        content="全部学习数据将被清空且不可恢复，建议先在设置中导出备份。"
        confirmText="确认重置"
        danger
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
          toast('已重置全部学习数据', 'success');
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
