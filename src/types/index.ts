/**
 * plugin options
 * @translate 插件配置
 */
export interface PluginOption {
  /**
   * relative path to the directory to search for page files
   * @default 'src/views'
   */
  pageDir: string;
  /**
   * glob to match page files, based on the pageDir property
   * @default [ '** /index.{vue,tsx,jsx}', '!** /components/**' ]
   * - attention: there is no blank after '**'
   * @link the detail syntax: https://github.com/micromatch/micromatch
   */
  pageGlob: string[];
  /**
   * relative path to the directory to generate the route declaration.
   * @default 'src/typings/page-route.d.ts'
   */
  routeDts: string;
  /**
   * relative path to the directory to generate the code of route module const
   * @default src/router/modules
   */
  routeModuleDir: string;
  /**
   * the type declaretion of the generated route module item
   * @default AuthRoute.Route
   * @example
   * ```ts
   * const route: AuthRoute.Route = {
   *   name: 'home',
   *   path: '/home',
   *   component: 'self',
   *   meta: {
   *     title: 'home',
   *     singleLayout: 'basic'
   *   }
   * }
   * export default route;
   * ```
   */
  routeModuleType: string;
  /**
   * transform the route name
   * @param name
   */
  routeNameTansformer(name: string): string;
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
   * @param names the names of the route
   */
  importHandler(names: string[]): { name: string; lazy: boolean }[];
}

export interface ContextOption extends PluginOption {
  rootDir: string;
  pagePattern: RegExp[];
}

/**
 * the route name and the import path
 */
export interface RouteFile {
  name: string;
  path: string;
}

/**
 * the route config
 */
export interface RouteConfig {
  names: string[];
  files: RouteFile[];
}

/**
 * the component type of route
 * - basic - the basic layout, has common part of page
 * - blank - the blank layout
 * - multi - the multi degree route layout, when the degree is more than 2,
 * exclude the first degree and the last degree, the type of other is multi
 * - self - use self layout, which is the last degree route
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

export type FileWatcherEvent = 'addDir' | 'unlinkDir' | 'add' | 'unlink';

export interface FileWatcherDispatch {
  event: FileWatcherEvent;
  path: string;
}
