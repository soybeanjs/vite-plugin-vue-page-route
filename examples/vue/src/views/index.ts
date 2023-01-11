import type { RouteComponent } from 'vue-router';

export const views: Record<
  PageRoute.LastDegreeRouteKey,
  RouteComponent | (() => Promise<{ default: RouteComponent }>)
> = {
  404: () => import('./_builtin/404/index.vue'),
  login: () => import('./_builtin/login/index.vue'),
  about: () => import('./about/index.vue'),
  demo: () => import('./demo/index.vue'),
  home1_fifth: () => import('./home1/fifth/index.vue'),
  'home1_first-page': () => import('./home1/first-page/index.vue'),
  home1_four: () => import('./home1/four/index.vue'),
  home1_multi_first: () => import('./home1/multi/first/index.vue'),
  home1_multi_second: () => import('./home1/multi/second/index.vue'),
  'home1_multi_third_third-child1': () => import('./home1/multi/third/third-child1/index.vue'),
  'home1_multi_third_third-child2': () => import('./home1/multi/third/third-child2/index.vue'),
  'home1_second-page': () => import('./home1/second-page/index.vue'),
  home1_third: () => import('./home1/third/index.vue'),
  'one_two_three-1': () => import('./one/two/three-1/index.vue'),
  'one_two_three-ano': () => import('./one/two/three-ano/index.vue'),
  test: () => import('./test/index.vue')
};
