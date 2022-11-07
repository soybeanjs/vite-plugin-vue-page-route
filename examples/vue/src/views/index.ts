import type { RouteComponent } from 'vue-router';
import about from './about/index.vue';
import _view_404 from './_builtin/404/index.vue';
import login from './_builtin/login/index.vue';

export const views: Record<RouterPage.LastDegreeRouteKey, RouteComponent | (() => Promise<RouteComponent>)> = {
  about,
  demo: () => import('./demo/index.vue'),
  404: _view_404,
  login,
  home_first: () => import('./home/first/index.vue'),
  home_four: () => import('./home/four/index.vue'),
  home_second: () => import('./home/second/index.vue'),
  home_third: () => import('./home/third/index.vue')
};
