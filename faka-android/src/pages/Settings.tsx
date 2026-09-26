import { useRef, useState, type ReactNode } from 'react';
import { router } from '../router/stack.ts';
import { useAppStore } from '../state/useAppStore.ts';
import { exportBackup, shareJson, downloadJson, backupFileName, importBackup, validateBackup } from '../core/backup.ts';
import { isValidHM, formatDate } from '../utils/date.ts';
import { toast } from '../utils/toast.ts';
import { AppBar } from '../components/AppBar.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';

function Row({ label, desc, children }: { label: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-sub mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * 设置（T05）：每日上限 / 关键词提示 / 主题 / 字体缩放 / 考试日期 / 每日提醒（T05.3，
 * 实际调度在 useReminder hook）/ 备份导出导入（C-2）。
 */
export default function Settings() {
  const settings = useAppStore((s) => s.settings);
  const saveSettings = useAppStore((s) => s.saveSettings);
  const setExamDate = useAppStore((s) => s.setExamDate);
  const reload = useAppStore((s) => s.reload);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  /** 已通过校验、等待用户二次确认的备份内容（ARCH §4.7：写盘前必须确认） */
  const [pendingImport, setPendingImport] = useState<{ text: string; name: string } | null>(null);

  const examDateStr = settings.examDate > 0 ? formatDate(settings.examDate) : '';

  const onExport = async () => {
    const { fileName, text } = await exportBackup();
    const shared = await shareJson(text, fileName);
    if (!shared) {
      const ok = downloadJson(text, fileName);
      toast(ok ? `已导出 ${backupFileName()}` : '导出失败', ok ? 'success' : 'error');
    } else {
      toast('已调起系统分享', 'success');
    }
  };

  /** 选文件后只做读取 + 校验（不写盘）；validateBackup 通过 → 弹二次确认 */
  const onImportFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        toast('备份文件格式错误：不是合法 JSON', 'error');
        return;
      }
      const err = validateBackup(parsed);
      if (err) {
        toast(err, 'error');
        return;
      }
      setPendingImport({ text, name: file.name });
    } catch (e) {
      toast(`文件读取失败：${e instanceof Error ? e.message : '未知异常'}`, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  /** 确认后执行覆盖导入 */
  const confirmImport = async () => {
    if (!pendingImport) return;
    const { text } = pendingImport;
    setPendingImport(null);
    setImporting(true);
    try {
      const result = await importBackup(text);
      if (result.ok) {
        reload();
        toast('导入成功，学习数据已恢复', 'success');
      } else {
        toast(result.reason, 'error');
      }
    } catch (e) {
      toast(`导入失败：${e instanceof Error ? e.message : '写入异常'}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AppBar title="设置" back />
      <div className="flex-1 overflow-auto no-scrollbar px-4 py-3">
        {/* 学习计划 */}
        <div className="text-sm font-semibold mb-2 mt-1">学习计划</div>
        <div className="card-box overflow-hidden">
          <Row label="每日新学上限" desc="当前：每日最多进入队列的新卡数">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="tap min-w-9 rounded-lg border border-line text-center active:bg-bg"
                onClick={() => saveSettings({ dailyNew: Math.max(5, settings.dailyNew - 5) })}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold">{settings.dailyNew}</span>
              <button
                type="button"
                className="tap min-w-9 rounded-lg border border-line text-center active:bg-bg"
                onClick={() => saveSettings({ dailyNew: Math.min(100, settings.dailyNew + 5) })}
              >
                +
              </button>
            </div>
          </Row>
          <Row label="每日复习上限" desc="到期复习卡的单日抽取上限">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="tap min-w-9 rounded-lg border border-line text-center active:bg-bg"
                onClick={() => saveSettings({ dailyReview: Math.max(10, settings.dailyReview - 10) })}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold">{settings.dailyReview}</span>
              <button
                type="button"
                className="tap min-w-9 rounded-lg border border-line text-center active:bg-bg"
                onClick={() => saveSettings({ dailyReview: Math.min(300, settings.dailyReview + 10) })}
              >
                +
              </button>
            </div>
          </Row>
          <Row label="默写关键词提示" desc="背诵默写时展示采分点关键词">
            <Switch on={settings.showKeywordTip} onChange={(v) => saveSettings({ showKeywordTip: v })} />
          </Row>
        </div>

        {/* 外观 */}
        <div className="text-sm font-semibold mb-2 mt-4">外观</div>
        <div className="card-box overflow-hidden">
          <Row label="深色模式">
            <div className="flex gap-1">
              {(
                [
                  ['system', '跟随'],
                  ['light', '浅色'],
                  ['dark', '深色']
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  className={`tap min-h-8 px-2.5 rounded-lg text-xs border ${
                    settings.theme === v ? 'bg-primary text-white border-primary' : 'bg-card text-sub border-line'
                  }`}
                  onClick={() => saveSettings({ theme: v })}
                >
                  {label}
                </button>
              ))}
            </div>
          </Row>
          <Row label="字体缩放" desc="只缩放文字，不改变布局">
            <div className="flex gap-1">
              {[0.9, 1, 1.1, 1.2, 1.3].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`tap min-h-8 w-9 rounded-lg text-xs border ${
                    Math.abs(settings.fontScale - v) < 0.01
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-sub border-line'
                  }`}
                  onClick={() => saveSettings({ fontScale: v })}
                >
                  {v === 1 ? '标准' : v}
                </button>
              ))}
            </div>
          </Row>
        </div>

        {/* 考试与提醒 */}
        <div className="text-sm font-semibold mb-2 mt-4">考试与提醒</div>
        <div className="card-box overflow-hidden">
          <Row label="考试日期" desc={examDateStr ? `当前：${examDateStr}` : '未设置（以司法部官方公告为准）'}>
            <input
              type="date"
              className="tap rounded-lg border border-line bg-card px-2 text-sm"
              value={settings.examDate > 0 ? formatDate(settings.examDate) : ''}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setExamDate(0);
                  return;
                }
                const [y, m, d] = v.split('-').map(Number);
                if (y && m && d) setExamDate(new Date(y, m - 1, d, 0, 0, 0).getTime());
              }}
            />
          </Row>
          <Row label="每日背诵提醒" desc="开启后每天定时推送本地通知（T05.3）">
            <Switch
              on={settings.remind}
              onChange={(v) => {
                if (!v || isValidHM(settings.remindAt)) saveSettings({ remind: v });
                else toast('提醒时间格式无效', 'error');
              }}
            />
          </Row>
          {settings.remind && (
            <Row label="提醒时间">
              <input
                type="time"
                value={settings.remindAt}
                className="tap rounded-lg border border-line bg-card px-2 text-sm"
                onChange={(e) => {
                  const v = e.target.value;
                  if (isValidHM(v)) saveSettings({ remindAt: v });
                  else toast('时间格式：HH:mm', 'error');
                }}
              />
            </Row>
          )}
        </div>

        {/* 备份（C-2） */}
        <div className="text-sm font-semibold mb-2 mt-4">备份与恢复</div>
        <div className="card-box overflow-hidden">
          <button type="button" className="cell py-3 gap-3" onClick={onExport}>
            <span className="text-lg w-8 text-center">📤</span>
            <span className="flex-1 text-sm font-medium text-left">导出备份</span>
            <span className="text-sub">›</span>
          </button>
          <button
            type="button"
            className="cell py-3 gap-3"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            <span className="text-lg w-8 text-center">📥</span>
            <span className="flex-1 text-sm font-medium text-left">
              {importing ? '导入中…' : '导入备份'}
            </span>
            <span className="text-sub">›</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onImportFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="h-6" />
        <button
          type="button"
          className="text-xs text-sub text-center w-full py-2 active:opacity-60"
          onClick={() => router.pop()}
        >
          返回
        </button>
      </div>

      {/* 导入二次确认（文件已通过 schema 校验） */}
      <ConfirmDialog
        open={pendingImport !== null}
        title="确认导入备份？"
        content={
          pendingImport
            ? `将用「${pendingImport.name}」覆盖当前全部学习数据（进度/错题/收藏/设置等），此操作不可撤销。建议先导出当前数据。`
            : ''
        }
        confirmText="覆盖导入"
        danger
        onConfirm={() => void confirmImport()}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}

/** 开关（自绘，无第三方依赖） */
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`no-select w-11 h-7 rounded-full relative transition-colors shrink-0 ${on ? 'bg-primary' : 'bg-line'}`}
      onClick={() => onChange(!on)}
    >
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all`}
        style={{ left: on ? 'calc(100% - 26px)' : '2px' }}
      />
    </button>
  );
}
