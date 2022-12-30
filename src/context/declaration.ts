import { writeFile } from 'fs/promises';
import { ROOT_ROUTE, NOT_FOUND_ROUTE, handleEslintFormat } from '../shared';
import type { ContextOption, RouteConfig } from '../types';

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

  await handleEslintFormat(filePath);
}
