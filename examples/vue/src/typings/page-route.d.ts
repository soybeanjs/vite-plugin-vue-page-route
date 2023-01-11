declare namespace PageRoute {
  /**
   * the root route key
   * @translate 根路由
   */
  type RootRouteKey = 'root';

  /**
   * the not found route, which catch the invalid route path
   * @translate 未找到路由(捕获无效路径的路由)
   */
  type NotFoundRouteKey = 'not-found';

  /**
   * the route key
   * @translate 页面路由
   */
  type RouteKey =
    | '404'
    | 'login'
    | 'about'
    | 'demo'
    | 'home1'
    | 'home1_fifth'
    | 'home1_first-page'
    | 'home1_four'
    | 'home1_multi'
    | 'home1_multi_first'
    | 'home1_multi_second'
    | 'home1_multi_third'
    | 'home1_multi_third_third-child1'
    | 'home1_multi_third_third-child2'
    | 'home1_second-page'
    | 'home1_third'
    | 'one'
    | 'one_two'
    | 'one_two_three-1'
    | 'one_two_three-ano'
    | 'one_two_three'
    | 'test';

  /**
   * last degree route key, which has the page file
   * @translate 最后一级路由(该级路有对应的页面文件)
   */
  type LastDegreeRouteKey = Extract<
    RouteKey,
    | '404'
    | 'login'
    | 'about'
    | 'demo'
    | 'home1_fifth'
    | 'home1_first-page'
    | 'home1_four'
    | 'home1_multi_first'
    | 'home1_multi_second'
    | 'home1_multi_third_third-child1'
    | 'home1_multi_third_third-child2'
    | 'home1_second-page'
    | 'home1_third'
    | 'one_two_three-1'
    | 'one_two_three-ano'
    | 'test'
  >;
}
