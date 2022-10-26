declare namespace RouterPage {
  /** 根路由 */
  type RootRouteKey = 'root';

  /** 未找到路由(捕获无效路径的路由) */
  type NotFoundRouteKey = 'not-found';

  /** 页面路由 */
  type PageRouteKey =
    | 'about'
    | 'demo'
    | 'home_first'
    | 'home_second'
    | 'system-view_404'
    | 'system-view_login';
}