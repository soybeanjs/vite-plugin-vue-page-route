import type { RouteComponent } from 'vue-router';
import _view_404 from './_builtin/404/index.vue';
import about from './about/index.vue';
import home_secondpage from './home/second-page/index.vue';

export const views: Record<
  RouterPage.LastDegreeRouteKey,
  RouteComponent | (() => Promise<{ default: RouteComponent }>)
> = {
  404: _view_404,
  login: () => import('./_builtin/login/index.vue'),
  about,
  demo: () => import('./demo/index.vue'),
  home_fifth: () => import('./home/fifth/index.vue'),
  'home_first-page': () => import('./home/first-page/index.vue'),
  home_four: () => import('./home/four/index.vue'),
  home_multi_first: () => import('./home/multi/first/index.vue'),
  'home_second-page': home_secondpage,
  home_third: () => import('./home/third/index.vue'),
  'one_two_three-1': () => import('./one/two/three-1/index.vue'),
  'one_two_three-ano': () => import('./one/two/three-ano/index.vue'),
  one_two_three: () => import('./one/two/three/index.vue'),
  test: () => import('./test/index.vue')
};
