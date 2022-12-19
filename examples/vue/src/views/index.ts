import type { RouteComponent } from 'vue-router';

export const views: Record<
  PageRoute.LastDegreeRouteKey,
  RouteComponent | (() => Promise<{ default: RouteComponent }>)
> = {
  404: () => import('./_builtin/404/index.vue'),
  login: () => import('./_builtin/login/index.vue'),
  about: () => import('./about/index.vue'),
  demo: () => import('./demo/index.vue'),
  home_fifth: () => import('./home/fifth/index.vue'),
  'home_first-page': () => import('./home/first-page/index.vue'),
  home_four: () => import('./home/four/index.vue'),
  home_multi_first: () => import('./home/multi/first/index.vue'),
  home_multi_second: () => import('./home/multi/second/index.vue'),
  'home_second-page': () => import('./home/second-page/index.vue'),
  home_third: () => import('./home/third/index.vue'),
  'one_two_three-1': () => import('./one/two/three-1/index.vue'),
  'one_two_three-ano': () => import('./one/two/three-ano/index.vue'),
  test: () => import('./test/index.vue')
};
