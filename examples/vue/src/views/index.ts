import type { RouteComponent } from 'vue-router';
import about from './about/index.vue';
import _view_404 from './_builtin/404/index.vue';
import home_secondpage from './home/second-page/index.vue';

export const views: Record<RouterPage.LastDegreeRouteKey, RouteComponent | (() => Promise<RouteComponent>)> = {
  about,
  demo: () => import('./demo/index.vue'),
  404: _view_404,
  login: () => import('./_builtin/login/index.vue'),
  'home_first-page': () => import('./home/first-page/index.vue'),
  home_four: () => import('./home/four/index.vue'),
  'home_second-page': home_secondpage,
  home_third: () => import('./home/third/index.vue')
};
