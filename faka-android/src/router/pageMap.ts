/**
 * 路由名 → 页面组件映射。
 * T05 批次后全部 18 路由落地，StubPage 仅保留作类型兜底。
 */
import type { ComponentType } from 'react';
import type { RouteName } from './stack.ts';
import { StubPage, type PageProps } from '../pages/StubPage.tsx';
import Home from '../pages/Home.tsx';
import Review from '../pages/Review.tsx';
import Mnemonic from '../pages/Mnemonic.tsx';
import Mine from '../pages/Mine.tsx';
import Chapter from '../pages/Chapter.tsx';
import Recite from '../pages/Recite.tsx';
import EssayList from '../pages/EssayList.tsx';
import EssayDetail from '../pages/EssayDetail.tsx';
import CaseList from '../pages/CaseList.tsx';
import CaseDetail from '../pages/CaseDetail.tsx';
import QuestionTypes from '../pages/QuestionTypes.tsx';
import Clause from '../pages/Clause.tsx';
import Search from '../pages/Search.tsx';
import Settings from '../pages/Settings.tsx';
import About from '../pages/About.tsx';
import WrongBook from '../pages/WrongBook.tsx';
import Favorites from '../pages/Favorites.tsx';
import UserCards from '../pages/UserCards.tsx';

export const PAGE_MAP: Record<RouteName, ComponentType<PageProps>> = {
  home: Home,
  review: Review,
  mnemonic: Mnemonic,
  mine: Mine,
  chapter: Chapter,
  recite: Recite,
  essayList: EssayList,
  essayDetail: EssayDetail,
  caseList: CaseList,
  caseDetail: CaseDetail,
  questionTypes: QuestionTypes,
  clause: Clause,
  search: Search,
  settings: Settings,
  about: About,
  wrongBook: WrongBook,
  favorites: Favorites,
  userCards: UserCards
};
