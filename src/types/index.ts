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
  pageGlobs: string[];
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
   * whether the route is lazy import
   * @param name route name
   * @example
   * - the direct import
   * ```ts
   * import Home from './views/home/index.vue';
   * ```
   * - the lazy import
   * ```ts
   * const Home = import('./views/home/index.vue');
   * ```
   */
  lazyImport(name: string): boolean;
}

export interface ContextOption extends PluginOption {
  rootDir: string;
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

export interface FileWatcherHooks {
  /**
   * rename the directory, which includes page files
   * @example
   * ```
   * example1:
   * home                    home-new
   * ├── first               ├── first
   * │   └── index.vue  ==>  │   └── index.vue
   * └── second              └── second
   *     └── index.vue           └── index.vue
   * example2:
   * home                    home
   * └── first          ==>  └── first-new
   *     └── index.vue           └── index.vue
   * ```
   */
  onRenameDirWithFile(): Promise<void>;
  /**
   * delete the directory, which includes page files
   * * @example
   * ```
   * example1:
   * home
   * ├── first
   * │   └── index.vue  ==> (delete directory home)
   * └── second
   *     └── index.vue
   * example2:
   * home                      home
   * ├── first           ==>   └── first
   * │   └── index.vue             └── index.vue
   * └── second
   *     └── index.vue
   * ```
   */
  onDelDirWithFile(): Promise<void>;
  /**
   * add a directory, which includes page files, it may be a copy action
   * * @example
   * ```
   * example1:
   *                               home
   *                               ├── first
   * (add directory home)   ==>    │   └── index.vue
   *                               └── second
   *                                   └── index.vue
   * example2:
   * home                      home
   * └── second                ├── first
   *     └── index.vue  ==>    │   └── index.vue
   *                           └── second
   *                               └── index.vue
   * ```
   */
  onAddDirWithFile(): Promise<void>;
  /**
   * delete a page file
   * @example
   * ```
   * example1:
   * home           ==>      home
   * └── index.vue
   * example2:
   * home           ==>      home
   * └── first               └── first
   *     └── index.vue
   * ```
   */
  onDelFile(): Promise<void>;
  /**
   * add a page file
   * @example
   * ```
   * example1:
   * home        ==>       home
   *                       └── index.vue
   * example2:
   * home        ==>       home
   * └── first             └── first
   *                           └── index.vue
   * ```
   */
  onAddFile(): Promise<void>;
}
