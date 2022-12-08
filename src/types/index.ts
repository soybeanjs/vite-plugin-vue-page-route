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

type FilterPattern = ReadonlyArray<string | RegExp> | string | RegExp | null;

/**
 * plugin options
 * @translate 插件配置
 */
export interface PluginOption {
  /**
   * the directory of the pages
   * - default: {Root}/src/views
   * @translate 页面的目录
   * - 默认: {Root}/src/views
   */
  pageDir: string;
  /**
   * the file name pattern as page
   * - default: ['index.{vue,tsx,jsx}']
   * @link https://github.com/mrmlnc/fast-glob
   * @translate 作为页面的文件名称匹配规则
   * - 默认: ['index.{vue,tsx,jsx}']
   */
  pageFilePattern: string[];
  /**
   * the directories will be excluded, which will not be scaned
   * - default: [components]
   * @translate 被排除的目录，该目录下不会被扫描
   * - 默认：[components]
   */
  excludeDirs: string[];
  /**
   * the ignore dir, which will not as the part of route name,
   * but the files will be scaned under this directory
   * - default: /^_/
   * @translate 需要忽略的目录, 匹配到的目录不会作为路由名称的一部分
   * - 默认: /^_/]
   */
  ignoreRouteDirs: FilterPattern;
  /**
   * the declaration file path of route.
   * default: {Root}/src/typings/page-route.d.ts
   * @translate 生成的路由声明文件所在的路径
   * - 默认: {Root}/src/typings/page-route.d.ts
   */
  routeDts: string;
  /**
   * the route module directory, the const code of the route modules will be genareted under this directory
   * default: {Root}/src/router/modules
   * @translate 路由模块的文件夹，路由模块的定义代码会自动生成在该目录下
   * 默认: {Root}/src/router/modules
   */
  routeModuleDir: string;
  /**
   * the type declaretion of the generated route module item
   * default: AuthRoute.Route
   * 【生成的路由模块声明，默认：AuthRoute.Route】
   */
  routeModuleDeclaration: string;
  /**
   * the import type of the page file, direct import or lazy import
   * @example
   * - the direct import
   * ```ts
   * import Home from './views/home/index.vue';
   * ```
   * - the lazy import
   * ```ts
   * const Home = import('./views/home/index.vue');
   * ```
   * @param names the names of the route [路由的名称]
   * @property lazy is lazy import, default: all route file is lazy import
   * @translate 路由文件导入的方式, 直接导入和懒加载导入
   */
  importHandler(names: string[]): { name: string; lazy: boolean }[];
}

/**
 * the route name and the import path
 * @translate 路由的名称和导入路径
 */
export interface RouteImport {
  name: string;
  path: string;
}

/**
 * the component type of route [路由的组件类型]
 * - basic - the basic layout, which has common part
 * [基础布局，具有公共部分的布局]
 * - blank - the blank layout [空白布局]
 * - multi - the multi degree route layout, when the degree is more than 2,
 * exclude the first degree and the last degree, the type of other is multi
 * [多级路由布局(三级路由或三级以上时，除第一级路由和最后一级路由，其余的采用该布局)]
 * - self - use self layout, which is the last degree route
 * [使用自身的布局, 作为最后一级路由(如果只有一级路由则是它本身)]
 */
export type RouteComponentType = 'basic' | 'blank' | 'multi' | 'self';

/**
 * the route module
 */
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
