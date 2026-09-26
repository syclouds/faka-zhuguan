/**
 * ★ 双层持久化 + Capacitor Preferences 异步镜像（ARCH §4.8 / §9.6）
 *
 * L1 内存 Map（进程内缓存，所有读先走这里）
 * L2 localStorage（同步读写，保证 get/set/remove 同步签名与小程序 utils/store.js 完全一致）
 * L3 Capacitor Preferences（异步镜像 fire-and-forget，防 WebView 数据被系统清理；Node/纯浏览器环境自动跳过）
 *
 * 启动 hydrate()：Preferences 为准覆盖 L1/L2；退出 flushAll() 全量补写。
 * 读写失败一律 try/catch 兜底，绝不抛异常（A-6）。
 */

/** 逻辑 key → 物理 key（fk_* 前缀，与小程序互通，保证备份文件兼容） */
const KEY_MAP: Record<string, string> = {
  progress: 'fk_progress',
  settings: 'fk_settings',
  stats: 'fk_stats',
  wrongList: 'fk_wrong',
  favorites: 'fk_fav',
  examDate: 'fk_exam_date',
  cards: 'fk_user_cards',
  lastQueueDate: 'fk_last_queue',
  caseRecords: 'fk_case_records',
  drafts: 'fk_drafts',
  disclaimerAck: 'fk_disclaimer_ack',
  searchHistory: 'fk_search_history'
};

function resolveKey(key: string): string {
  return KEY_MAP[key] || key;
}

/* ---------- L1 内存 ---------- */
const memory = new Map<string, unknown>();

/* ---------- L2 localStorage（不存在时静默降级为仅内存） ---------- */
function lsGet(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  } catch (err) {
    console.warn('[store] localStorage 写入失败', key, err);
  }
}

function lsRemove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  } catch (err) {
    console.warn('[store] localStorage 删除失败', key, err);
  }
}

/* ---------- L3 Capacitor Preferences（惰性动态加载，Node 环境不触发） ---------- */
interface PrefsLike {
  get(opts: { key: string }): Promise<{ value: string | null }>;
  set(opts: { key: string; value: string }): Promise<void>;
  remove(opts: { key: string }): Promise<void>;
  keys(): Promise<{ keys: string[] }>;
  clear(): Promise<void>;
}

let prefsApi: PrefsLike | null = null;
let prefsTried = false;
let prefsAvailable = false;

async function ensurePrefs(): Promise<void> {
  if (prefsTried) return;
  prefsTried = true;
  if (typeof window === 'undefined') return; // Node 冒烟测试环境
  try {
    const core = await import('@capacitor/core');
    if (!core.Capacitor.isNativePlatform()) return; // PWA 纯浏览器：localStorage 足够
    const mod = await import('@capacitor/preferences');
    prefsApi = (mod as unknown as { Preferences: PrefsLike }).Preferences;
    prefsAvailable = true;
  } catch (err) {
    console.warn('[store] Preferences 不可用（降级为 localStorage）', err);
    prefsAvailable = false;
  }
}

function mirrorSet(rk: string, value: unknown): void {
  if (!prefsAvailable || !prefsApi) return;
  const raw = value === undefined ? null : JSON.stringify(value);
  const p: Promise<void> =
    raw === null ? prefsApi.remove({ key: rk }) : prefsApi.set({ key: rk, value: raw });
  p.catch(() => {
    /* 镜像失败静默降级，不影响同步层 */
  });
}

function mirrorRemove(rk: string): void {
  if (!prefsAvailable || !prefsApi) return;
  prefsApi.remove({ key: rk }).catch(() => {});
}

/* ---------- 对外签名（与小程序 utils/store.js 完全一致：同步） ---------- */

/** 读：L1 → L2 → def；失败返回 def，绝不抛异常 */
export function get<T = unknown>(key: string, def?: T): T {
  const rk = resolveKey(key);
  try {
    if (memory.has(rk)) return memory.get(rk) as T;
    const raw = lsGet(rk);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as T;
      if (parsed === null || parsed === undefined) return def as T;
      memory.set(rk, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('[store] get 失败', key, err);
  }
  return def as T;
}

/** 写：同步生效（L1+L2），内部异步镜像 L3 */
export function set(key: string, value: unknown): void {
  const rk = resolveKey(key);
  try {
    memory.set(rk, value);
  } catch (err) {
    console.warn('[store] 内存写入失败', key, err);
  }
  try {
    if (value === undefined) {
      lsRemove(rk);
    } else {
      lsSet(rk, JSON.stringify(value));
    }
  } catch (err) {
    console.warn('[store] set 失败', key, err);
  }
  mirrorSet(rk, value);
}

/** 删：同步生效 + 异步镜像 */
export function remove(key: string): void {
  const rk = resolveKey(key);
  try {
    memory.delete(rk);
  } catch (err) {
    console.warn('[store] 内存删除失败', key, err);
  }
  try {
    lsRemove(rk);
  } catch (err) {
    console.warn('[store] remove 失败', key, err);
  }
  mirrorRemove(rk);
}

/* ---------- 启动/退出 ---------- */

/** 仅启动调用一次：Preferences 为准覆盖 L1/L2（原生层更可靠） */
export async function hydrate(): Promise<void> {
  await ensurePrefs();
  if (!prefsAvailable || !prefsApi) return;
  try {
    const { keys } = await prefsApi.keys();
    for (const rawKey of keys) {
      if (!rawKey.startsWith('fk_')) continue;
      try {
        const { value } = await prefsApi.get({ key: rawKey });
        if (value === null || value === undefined) continue;
        const parsed = JSON.parse(value);
        memory.set(rawKey, parsed);
        lsSet(rawKey, value);
      } catch {
        /* 单键损坏忽略，不影响其他键 */
      }
    }
  } catch (err) {
    console.warn('[store] hydrate 失败（忽略，使用 localStorage）', err);
  }
}

/** 退出/App 切后台时全量补写 Preferences */
export async function flushAll(): Promise<void> {
  await ensurePrefs();
  if (!prefsAvailable || !prefsApi) return;
  try {
    for (const [rk, value] of memory.entries()) {
      if (!rk.startsWith('fk_')) continue;
      try {
        await prefsApi.set({ key: rk, value: JSON.stringify(value) });
      } catch {
        /* 单键失败继续 */
      }
    }
  } catch (err) {
    console.warn('[store] flushAll 失败', err);
  }
}

/** 测试辅助：清空内存层（不影响真实存储） */
export function resetMemoryForTest(): void {
  memory.clear();
}
