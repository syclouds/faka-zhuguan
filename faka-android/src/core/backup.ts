/**
 * 备份导出/导入（C-2，ARCH §4.7 / §5.3）
 * schema !== 1 时明确报错不崩溃；导入前由页面层二次确认。
 * 存储 key 全部 fk_* 前缀，与小程序备份互通（examDate 单独存 fk_exam_date）。
 */
import type { BackupFile, Settings } from '../types/index.ts';
import { DEFAULT_SETTINGS, APP_VERSION } from '../types/index.ts';
import { get, set, flushAll } from './store.ts';
import { getSettings } from './review.ts';

const BACKUP_APP = 'faka-android';

/** 组装备份对象（不触发下载/分享） */
export function buildBackup(): BackupFile {
  return {
    schema: 1,
    app: BACKUP_APP,
    version: APP_VERSION,
    exportedAt: Date.now(),
    data: {
      progress: get('progress', {}) || {},
      settings: getSettings(),
      stats: get('stats', { days: [], totalCards: 0, streak: 0 }) || { days: [], totalCards: 0, streak: 0 },
      wrongList: get('wrongList', []) || [],
      favorites: get('favorites', []) || [],
      userCards: get('cards', []) || [],
      caseRecords: get('caseRecords', {}) || {},
      drafts: get('drafts', {}) || {}
    }
  };
}

export function backupFileName(): string {
  const d = new Date();
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `faka-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
}

/** 导出：返回文件名与文本（下载/系统分享由页面层决定） */
export async function exportBackup(): Promise<{ fileName: string; text: string }> {
  const backup = buildBackup();
  await flushAll();
  return { fileName: backupFileName(), text: JSON.stringify(backup, null, 2) };
}

/** 浏览器/PWA 下载路径 */
export function downloadJson(text: string, fileName: string): boolean {
  try {
    if (typeof document === 'undefined') return false;
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    return true;
  } catch (err) {
    console.warn('[backup] 下载失败', err);
    return false;
  }
}

/** 安卓系统分享路径（写缓存文件 + Capacitor Share 拉起分享面板；失败静默降级返回 false） */
export async function shareJson(text: string, fileName: string): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    const core = await import('@capacitor/core');
    if (!core.Capacitor.isNativePlatform()) return false;
    const fs = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const result = await fs.Filesystem.writeFile({
      path: fileName,
      data: text,
      directory: fs.Directory.Cache,
      encoding: fs.Encoding.UTF8
    });
    await Share.share({
      title: fileName,
      text: '法考主观题速记备份文件',
      url: result.uri,
      dialogTitle: '保存或发送备份'
    });
    return true;
  } catch (err) {
    console.warn('[backup] 分享失败（可用下载兜底）', err);
    return false;
  }
}

/** 校验备份文件结构；通过返回错误原因 null，否则返回中文原因 */
export function validateBackup(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') return '备份文件格式不正确';
  const b = parsed as Partial<BackupFile>;
  if (b.schema !== 1) return '备份版本不兼容，请升级 App 后重试';
  if (b.app !== BACKUP_APP) return '不是本应用的备份文件';
  if (!b.data || typeof b.data !== 'object') return '备份数据缺失';
  return null;
}

/**
 * 导入：整体覆盖 8 类数据 + examDate + flushAll
 * 校验失败返回 { ok:false, reason }，绝不崩溃。
 */
export async function importBackup(text: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: '备份文件解析失败，请确认是完整的 JSON 文件' };
  }
  const invalid = validateBackup(parsed);
  if (invalid) return { ok: false, reason: invalid };

  const b = parsed as BackupFile;
  const d = b.data;
  try {
    set('progress', d.progress || {});
    set('settings', { ...DEFAULT_SETTINGS, ...(d.settings || {}) } as Settings);
    set('stats', d.stats || { days: [], totalCards: 0, streak: 0 });
    set('wrongList', Array.isArray(d.wrongList) ? d.wrongList : []);
    set('favorites', Array.isArray(d.favorites) ? d.favorites : []);
    set('cards', Array.isArray(d.userCards) ? d.userCards : []);
    set('caseRecords', d.caseRecords || {});
    set('drafts', d.drafts || {});
    // examDate 兼容：settings.examDate → fk_exam_date
    const examDate = (d.settings && typeof d.settings.examDate === 'number' && d.settings.examDate) || 0;
    set('examDate', examDate);
    await flushAll();
    return { ok: true };
  } catch (err) {
    console.warn('[backup] 导入写盘失败', err);
    return { ok: false, reason: '导入写盘失败，存储可能不可用' };
  }
}
