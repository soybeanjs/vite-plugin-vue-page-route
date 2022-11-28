declare namespace RouterPage {
  /** 根路由 */
  type RootRouteKey = 'root';

  /** 未找到路由(捕获无效路径的路由) */
  type NotFoundRouteKey = 'not-found';

  /** 页面路由 */
  type RouteKey =
    | '404'
    | 'about'
    | 'demo'
    | 'home'
    | 'home_fifth'
    | 'home_first-page'
    | 'home_four'
    | 'home_multi'
    | 'home_multi_first'
    | 'home_second-page'
    | 'home_third'
    | 'login'
    | 'one'
    | 'one_two'
    | 'one_two_three'
    | 'one_two_three-1'
    | 'one_two_three-ano'
    | 'test';

  /** 最后一级路由(该级路有对应的vue文件) */
  type LastDegreeRouteKey = Extract<RouteKey, '404' | 'about' | 'demo' | 'home_fifth' | 'home_first-page' | 'home_four' | 'home_multi_first' | 'home_second-page' | 'home_third' | 'login' | 'one_two_three' | 'one_two_three-1' | 'one_two_three-ano' | 'test'>
}
