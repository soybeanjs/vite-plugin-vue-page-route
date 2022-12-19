import { writeFile } from 'fs/promises';
import {
  ROOT_ROUTE,
  NOT_FOUND_ROUTE,
  getRenamedDirConfig,
  getDelDirConfig,
  getAddDirConfig,
  getDelFileConfig,
  getAddFileConfig
} from '../shared';
import type { ContextOption, RouteConfig, FileWatcherDispatch, FileWatcherHooks } from '../types';

function getDeclarationCode(routeConfig: RouteConfig) {
  let code = `declare namespace PageRoute {
  /**
   * the root route key
   * @translate 根路由
   */
  type RootRouteKey = '${ROOT_ROUTE}';

  /**
   * the not found route, which catch the invalid route path
   * @translate 未找到路由(捕获无效路径的路由)
   */
  type NotFoundRouteKey = '${NOT_FOUND_ROUTE}';

  /**
   * the route key
   * @translate 页面路由
   */
  type RouteKey =`;

  routeConfig.names.forEach(name => {
    code += `\n    | '${name}'`;
  });

  code += `;

  /**
   * last degree route key, which has the page file
   * @translate 最后一级路由(该级路有对应的页面文件)
   */
  type LastDegreeRouteKey = Extract<
    RouteKey,`;

  routeConfig.files.forEach(item => {
    code += `\n    | '${item.name}'`;
  });

  code += `
  >;\n}\n`;

  return code;
}

export async function generateDeclaration(routeConfig: RouteConfig, options: ContextOption) {
  const code = getDeclarationCode(routeConfig);

  const filePath = `${options.rootDir}/${options.routeDts}`;

  await writeFile(filePath, code, 'utf-8');
}

export function createFWHooksOfGenDeclarationAndViews(
  dispatchs: FileWatcherDispatch[],
  routeConfig: RouteConfig,
  options: ContextOption
) {
  const hooks: FileWatcherHooks = {
    async onRenameDirWithFile() {
      const { oldRouteName, newRouteName, oldRouteFilePath, newRouteFilePath } = getRenamedDirConfig(
        dispatchs,
        options
      );

      routeConfig.names = routeConfig.names.map(name => name.replace(oldRouteName, newRouteName));

      routeConfig.files = routeConfig.files.map(item => {
        const name = item.name.replace(oldRouteName, newRouteName);
        const path = item.path.replace(oldRouteFilePath, newRouteFilePath);

        return {
          name,
          path
        };
      });
    },
    async onDelDirWithFile() {
      const { delRouteName } = getDelDirConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.filter(name => !name.includes(delRouteName));
      routeConfig.files = routeConfig.files.filter(item => !item.name.includes(delRouteName));
    },
    async onAddDirWithFile() {
      const config = getAddDirConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.concat(config.names).sort();
      routeConfig.files = routeConfig.files.concat(config.files).sort((a, b) => (a.name > b.name ? 1 : -1));
    },
    async onDelFile() {
      const { delRouteNames } = getDelFileConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.filter(name => delRouteNames.every(item => !name.includes(item)));
      routeConfig.files = routeConfig.files.filter(item => delRouteNames.every(v => !item.name.includes(v)));
    },
    async onAddFile() {
      const config = getAddFileConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.concat(config.names).sort();
      routeConfig.files = routeConfig.files.concat(config.files).sort((a, b) => (a.name > b.name ? 1 : -1));
    }
  };

  return hooks;
}
