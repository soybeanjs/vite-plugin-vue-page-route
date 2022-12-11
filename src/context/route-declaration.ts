import { writeFile } from 'fs/promises';
import { getRelativePathFromRoot, ROOT_ROUTE, NOT_FOUND_ROUTE } from '../shared';
import type { ContextOption, RouteName } from '../types';

function getDeclaratonCode(routeName: RouteName) {
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

  routeName.all.forEach(name => {
    code += `\n    | '${name}'`;
  });

  code += `;

  /**
   * last degree route key, which has the page file
   * @translate 最后一级路由(该级路有对应的页面文件)
   */
  type LastDegreeRouteKey = Extract<
    RouteKey,`;
  routeName.lastDegree.forEach(name => {
    code += `\n    | '${name}'`;
  });

  code += `
  >;\n}\n`;

  return code;
}

export async function generateRouteDeclaraton(routeName: RouteName, options: ContextOption) {
  const code = getDeclaratonCode(routeName);

  const dtsPath = getRelativePathFromRoot(options.routeDts);

  const filePath = `${options.rootDir}/${dtsPath}`;

  await writeFile(filePath, code, 'utf-8');
}
