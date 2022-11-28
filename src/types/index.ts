/**
 * plugin options 【插件配置】
 */
export interface Options {
  /**
   * the directory of the pages.
   * default: src/views.
   * 【页面的目录，默认：src/views】
   */
  dir: string;
  /**
   * the directories will be excluded, which will not be scaned.
   * default: [components].
   * 【被排除的目录，该目录下不会被扫描，默认：[components]】
   */
  excludes: string[];
  /**
   * the declaration file path.
   * default: src/typings/router-page.d.ts.
   * 【生成的路由声明文件所在的路径，默认：src/typings/router-page.d.ts】
   */
  dts: string;
  /**
   * the route module directory, the route const will be genareted above this directory
   * default: src/router/modules
   * 【路由模块的文件夹，路由的定义会自动生成在该目录，默认：src/router/modules】
   */
  moduleDir: string;
  /**
   * the type declaretion of the generated route module item
   * default: AuthRoute.Route
   * 【生成的路由模块声明，默认：AuthRoute.Route】
   */
  moduleTypeConst: string;
  /**
   * the file name pattern as page
   * default: [index.vue]
   * 【作为页面的文件名称匹配规则】
   */
  patterns: string[];
  /**
   * the prefix of the ignore dir, which will not as the part of route name
   * default: '_'
   * 【需要忽略的目录前缀, 匹配到的目录不会作为路由名称的一部分】
   * 默认: '_'
   */
  ignoreDirPrefix: string;
  /**
   * names of the buildtin routes, which are necessary
   * 【系统内置的路由名称(必须存在的)】
   * root: rootRoute '/' 【根路由】
   * notFound: catch invalid route 【捕获无效的路由】
   */
  builtinRoute: { root: string; notFound: string };
  /**
   * the route's components imported directly, not lazy
   * default is lazy import
   * 【路由的组件不是懒加载的, 默认是懒加载】
   */
  noLazy: string[];
  /**
   * the page names formatter
   * 【页面名称格式化函数】
   */
  pagesFormatter: (names: string[]) => string[];
}

export interface ContextOptions extends Options {
  rootDir: string;
}

export interface NameWithModule {
  key: string;
  module: string;
}

/**
 * 路由的组件
 * - basic - 基础布局，具有公共部分的布局
 * - blank - 空白布局
 * - multi - 多级路由布局(三级路由或三级以上时，除第一级路由和最后一级路由，其余的采用该布局)
 * - self - 作为子路由，使用自身的布局(作为最后一级路由，没有子路由)
 */
export type RouteComponentType = 'basic' | 'blank' | 'multi' | 'self';

export interface RouteModule {
  name: string;
  path: string;
  redirect?: string;
  component: RouteComponentType;
  meta: {
    title: string;
    icon: string;
    singleLayout?: Extract<RouteComponentType, 'basic' | 'blank'>;
  };
  children?: RouteModule[];
}
