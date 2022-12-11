import { writeFile } from 'fs/promises';
import { getRelativePathFromRoot } from '../shared';
import type { RouteImport, ContextOption } from '../types';

function transformKey(key: string) {
  return key.includes('-') ? `'${key}'` : key;
}

function isPureNumberKey(key: string) {
  const NUM_REG = /^\d+$/;
  return NUM_REG.test(key);
}

function transformImportKey(key: string) {
  const result = isPureNumberKey(key) ? `_view_${key}` : key;

  return result;
}

function getRouteViewsCode(routeImports: RouteImport[], options: ContextOption) {
  const lazyImports = options.importHandler(routeImports.map(item => item.name));
  const checkIsLazy = (name: string) => Boolean(lazyImports.find(item => item.name === name)?.lazy);

  let preCode = `import type { RouteComponent } from 'vue-router';\n`;
  let code = `
export const views: Record<
  PageRoute.LastDegreeRouteKey,
  RouteComponent | (() => Promise<{ default: RouteComponent }>)
> = {`;

  routeImports.forEach(({ name, path }, index) => {
    const isLazy = checkIsLazy(name);

    const key = transformKey(name);

    if (isLazy) {
      code += `\n  ${key}: () => import('${path}')`;
    } else {
      const importKey = transformImportKey(name);

      preCode += `import ${importKey} from '${path}';\n`;

      if (key === path && !isPureNumberKey(name)) {
        code += `\n  ${key}`;
      } else {
        code += `\n  ${key}: ${importKey}`;
      }
    }

    if (index < routeImports.length - 1) {
      code += ',';
    }
  });

  code += '\n};\n';

  return preCode + code;
}

export async function generateRouteViews(routeImports: RouteImport[], options: ContextOption) {
  const code = getRouteViewsCode(routeImports, options);

  const pageDir = getRelativePathFromRoot(options.pageDir);

  const filePath = `${options.rootDir}/${pageDir}/index.ts`;

  await writeFile(filePath, code, 'utf-8');
}
