/**
 * 路由表元数据（ARCH §6.1）：路由名 → 标题 + Tab 归属。
 * 页面组件映射见 pageMap.ts（页面落地后逐批替换 StubPage）。
 */
import type { RouteName, TabName } from './stack.ts';

export interface RouteDef {
  name: RouteName;
  title: string;
  /** 'tab' = Tab 根；'inherit' = 继承进入方；'modal' = 模态栈 */
  tab: TabName | 'inherit' | 'modal';
}

export const ROUTES: Record<RouteName, RouteDef> = {
  home: { name: 'home', title: '法考主观题速记', tab: 'home' },
  review: { name: 'review', title: '背诵台', tab: 'review' },
  mnemonic: { name: 'mnemonic', title: '口诀', tab: 'mnemonic' },
  mine: { name: 'mine', title: '我的', tab: 'mine' },
  chapter: { name: 'chapter', title: '章节', tab: 'home' },
  recite: { name: 'recite', title: '背诵卡', tab: 'inherit' },
  essayList: { name: 'essayList', title: '论述模板', tab: 'home' },
  essayDetail: { name: 'essayDetail', title: '论述详情', tab: 'home' },
  caseList: { name: 'caseList', title: '案例训练', tab: 'mine' },
  caseDetail: { name: 'caseDetail', title: '案例详情', tab: 'inherit' },
  questionTypes: { name: 'questionTypes', title: '设问类型答法', tab: 'inherit' },
  clause: { name: 'clause', title: '法条速查', tab: 'inherit' },
  search: { name: 'search', title: '全文检索', tab: 'modal' },
  settings: { name: 'settings', title: '设置', tab: 'mine' },
  about: { name: 'about', title: '关于与免责声明', tab: 'mine' },
  wrongBook: { name: 'wrongBook', title: '错题本', tab: 'mine' },
  favorites: { name: 'favorites', title: '收藏', tab: 'mine' },
  userCards: { name: 'userCards', title: '自建考点', tab: 'mine' }
};

export function pageTitle(name: RouteName): string {
  return ROUTES[name]?.title || name;
}
