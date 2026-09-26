/**
 * ★ 页面栈内核（ARCH §6.2，自建轻量路由，不用 react-router）
 *
 * 6 条规则：
 * 1. 4 个 Tab 各自维护独立栈，切 Tab 不丢栈内页面与滚动位置；
 * 2. 物理/手势返回 → handleBack()：栈顶 leaveGuard 返回 true → 消费；否则 pop()；
 * 3. 离场守卫优先级由页面（Recite）自行实现（收键盘 → 二次确认 → 放行）；
 * 4. 根页面双击退出：栈深度=1 且位于 Tab 根 → 布防「再按一次退出」，2s 内二次触发 → exit；
 * 5. hash 同步：pushState 镜像（PWA 刷新保位置），popstate 与返回键用一次性 navSource 标记去重；
 * 6. 案例训练完成 → popTo('caseList')。
 *
 * 纯逻辑无 DOM 依赖（window/history 使用处均判空），可在 Node 冒烟测试中直接运行。
 */

export type RouteName =
  | 'home'
  | 'review'
  | 'mnemonic'
  | 'mine'
  | 'chapter'
  | 'recite'
  | 'essayList'
  | 'essayDetail'
  | 'caseList'
  | 'caseDetail'
  | 'questionTypes'
  | 'clause'
  | 'search'
  | 'settings'
  | 'about'
  | 'wrongBook'
  | 'favorites'
  | 'userCards';

export const TAB_NAMES = ['home', 'review', 'mnemonic', 'mine'] as const;
export type TabName = (typeof TAB_NAMES)[number];

export const TAB_ROOT: Record<TabName, RouteName> = {
  home: 'home',
  review: 'review',
  mnemonic: 'mnemonic',
  mine: 'mine'
};

export interface RouteEntry {
  name: RouteName;
  params: Record<string, string>;
  key: string;
}

export type BackResult = 'consumed' | 'popped' | 'armed' | 'exit';

type Listener = () => void;

const KNOWN_ROUTES: RouteName[] = [
  'home', 'review', 'mnemonic', 'mine', 'chapter', 'recite', 'essayList', 'essayDetail',
  'caseList', 'caseDetail', 'questionTypes', 'clause', 'search', 'settings', 'about',
  'wrongBook', 'favorites', 'userCards'
];

class Router {
  activeTab: TabName = 'home';
  stacks: Record<TabName, RouteEntry[]>;
  /** 快照版本号（useSyncExternalStore 用） */
  version = 0;
  /** 双击退出布防时间戳（0 = 未布防） */
  exitArmedAt = 0;

  private listeners = new Set<Listener>();
  private keySeed = 1;
  private guard: (() => boolean) | null = null;
  /** navSource 去重标记：本次 hash 变化由本类主动写入，popstate 时跳过 */
  private suppressNextPopState = false;

  constructor() {
    this.stacks = {
      home: [],
      review: [],
      mnemonic: [],
      mine: []
    };
    for (const t of TAB_NAMES) {
      this.stacks[t] = [this.makeEntry(TAB_ROOT[t])];
    }
  }

  /* ---------- 基础 ---------- */

  private makeEntry(name: RouteName, params: Record<string, string> = {}): RouteEntry {
    return { name, params, key: `k${this.keySeed++}` };
  }

  private emit(): void {
    this.version += 1;
    for (const l of Array.from(this.listeners)) {
      try {
        l();
      } catch (err) {
        console.warn('[router] listener 异常', err);
      }
    }
    this.syncHash();
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }

  isTabName(name: string): name is TabName {
    return (TAB_NAMES as readonly string[]).includes(name);
  }

  top(tab: TabName = this.activeTab): RouteEntry {
    const s = this.stacks[tab];
    return s[s.length - 1];
  }

  depth(tab: TabName = this.activeTab): number {
    return this.stacks[tab].length;
  }

  canPop(tab: TabName = this.activeTab): boolean {
    return this.stacks[tab].length > 1;
  }

  /* ---------- 导航操作 ---------- */

  push(name: RouteName, params: Record<string, string> = {}): void {
    this.stacks[this.activeTab].push(this.makeEntry(name, params));
    this.emit();
  }

  replace(name: RouteName, params: Record<string, string> = {}): void {
    const s = this.stacks[this.activeTab];
    s[s.length - 1] = this.makeEntry(name, params);
    this.emit();
  }

  /** 逐级返回；栈底返回 false */
  pop(): boolean {
    if (!this.canPop()) return false;
    this.stacks[this.activeTab].pop();
    this.emit();
    return true;
  }

  /** 回到栈内某页（如案例完成后回列表）；找不到返回 false（调用方决定 fallback） */
  popTo(name: RouteName, params?: Record<string, string>): boolean {
    const s = this.stacks[this.activeTab];
    for (let i = s.length - 1; i >= 0; i--) {
      if (s[i].name === name) {
        const keep = s.slice(0, i + 1);
        if (params) keep[i] = { ...keep[i], params };
        this.stacks[this.activeTab] = keep;
        this.emit();
        return true;
      }
    }
    return false;
  }

  /** 切 Tab：各 Tab 独立栈，互不销毁 */
  switchTab(name: TabName): void {
    if (this.activeTab === name) return;
    this.activeTab = name;
    this.emit();
  }

  /** 清空当前栈，重置为单页 */
  reset(name: RouteName, params: Record<string, string> = {}): void {
    this.stacks[this.activeTab] = [this.makeEntry(name, params)];
    this.emit();
  }

  /* ---------- 离场守卫与返回键 ---------- */

  /** 注册离场守卫；返回注销函数。守卫返回 true = 消费本次返回（不退出） */
  setLeaveGuard(fn: () => boolean): () => void {
    this.guard = fn;
    return () => {
      if (this.guard === fn) this.guard = null;
    };
  }

  hasLeaveGuard(): boolean {
    return this.guard !== null;
  }

  /**
   * 物理/手势返回键统一入口：
   * 'consumed' 守卫消费（收键盘/弹确认）
   * 'popped'   已 pop 一级
   * 'armed'    Tab 根页第一次按（布防「再按一次退出」）
   * 'exit'     2s 内第二次按（调用方执行 App.exitApp()）
   */
  handleBack(): BackResult {
    if (this.guard && this.guard()) return 'consumed';
    if (this.canPop()) {
      this.pop();
      return 'popped';
    }
    const now = Date.now();
    if (this.exitArmedAt && now - this.exitArmedAt <= 2000) {
      this.exitArmedAt = 0;
      return 'exit';
    }
    this.exitArmedAt = now;
    return 'armed';
  }

  /* ---------- hash 同步（浏览器/PWA 场景；Node 与原生 WebView 内安全跳过） ---------- */

  private hashOf(): string {
    const top = this.top();
    const params = new URLSearchParams(top.params).toString();
    return `#/${top.name}${params ? `?${params}` : ''}`;
  }

  private syncHash(): void {
    if (typeof window === 'undefined' || typeof history === 'undefined') return;
    this.suppressNextPopState = true;
    try {
      history.pushState(null, '', this.hashOf());
    } catch {
      /* file:// 等环境 pushState 可能受限，静默 */
    }
  }

  /** 解析 hash → 路由（未知路由返回 null） */
  parseHash(hash: string): { name: RouteName; params: Record<string, string> } | null {
    const h = (hash || '').replace(/^#\/?/, '');
    if (!h) return null;
    const [path, query] = h.split('?');
    if (!(KNOWN_ROUTES as string[]).includes(path)) return null;
    const params: Record<string, string> = {};
    if (query) {
      for (const [k, v] of new URLSearchParams(query).entries()) params[k] = v;
    }
    return { name: path as RouteName, params };
  }

  /**
   * popstate 回调（浏览器/PWA 返回）：与栈同步。
   * navSource 去重：hash 由本类写入时 pushState 自身不触发 popstate，但 Safari/旧内核可能补发；
   * 若事件与最近一次 syncHash 同帧到达则跳过（一次性标记）。
   */
  onPopState(): void {
    if (this.suppressNextPopState) {
      this.suppressNextPopState = false;
      return;
    }
    if (typeof location === 'undefined') return;
    const target = this.parseHash(location.hash);
    if (!target) return;

    // 1) 与当前栈顶一致 → 无需动作
    const top = this.top();
    if (top.name === target.name && JSON.stringify(top.params) === JSON.stringify(target.params)) return;

    // 2) 当前栈深度 > 1 → 视作浏览器返回：执行离场守卫，消费则恢复 hash，否则同步 pop
    if (this.canPop()) {
      if (this.guard && this.guard()) {
        try {
          history.pushState(null, '', this.hashOf());
        } catch {
          /* ignore */
        }
        return;
      }
      this.pop();
      return;
    }

    // 3) 栈底：目标是某个 Tab 根 → 切 Tab；否则 replace（保持单页栈）
    if (this.isTabName(target.name) && TAB_ROOT[target.name as TabName] === target.name) {
      this.switchTab(target.name as TabName);
    } else {
      this.replace(target.name, target.params);
    }
  }
}

export const router = new Router();
