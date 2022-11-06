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
   * the directories will be excluded.
   * default: [components].
   * 【被排除的目录，默认：[components]】
   */
  excludes: string[];
  /**
   * the declaration file path.
   * default: src/typings/router-page.d.ts.
   * 【生成的声明文件所在的路径，默认：src/typings/router-page.d.ts】
   */
  dts: string;
  /**
   * pattern of the page file name
   * default: [index.vue]
   * 【匹配页面的文件名，默认：[index.vue]】
   */
  patterns: string[];
  /**
   * names of the buildtin routes, which are necessary
   * 【系统内置的路由名称(必须存在的)】
   * root: rootRoute '/' 【根路由】
   * notFound: catch invalid route 【捕获无效的路由】
   */
  builtinRoute: { root: string; notFound: string };
  /**
   * the page names formatter
   * 【页面名称格式化函数】
   */
  pagesFormatter: (names: string[]) => string[];
}

export interface ContextOptions extends Options {
  rootDir: string;
}
