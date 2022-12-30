import { writeFile } from 'fs/promises';
import { getRouteModuleFilePath, handleEslintFormat } from '../shared';
import type { ContextOption, RouteModule } from '../types';

export function isDeleteWholeModule(deletes: string[], files: string[], moduleName: string) {
  const remains = files.filter(item => !deletes.includes(item));

  return remains.every(item => !item.includes(moduleName));
}

export async function generateRouteModuleCode(moduleName: string, module: RouteModule, options: ContextOption) {
  const filePath = getRouteModuleFilePath(moduleName, options);

  const code = `const ${moduleName}: ${options.routeModuleType} = ${JSON.stringify(
    module
  )};\n\nexport default ${moduleName};`;

  await writeFile(filePath, code, 'utf-8');

  await handleEslintFormat(filePath);
}

export function removeRouteModule(routeName: string, children?: RouteModule[]) {
  if (!children || !children.length) return;
  const findIndex = children.findIndex(item => item.name === routeName);

  if (findIndex > -1) {
    children.splice(findIndex, 1);
  } else {
    children.forEach(item => {
      removeRouteModule(routeName, item.children);
    });
  }
}
