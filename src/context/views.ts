import { writeFile } from 'fs/promises';
import { handleEslintFormat } from '../shared';
import type { ContextOption, RouteFile } from '../types';

function transformKey(key: string) {
  return key.includes('-') ? `'${key}'` : key;
}

function isPureNumberKey(key: string) {
  const NUM_REG = /^\d+$/;
  return NUM_REG.test(key);
}

function transformImportKey(key: string) {
  const tranform = isPureNumberKey(key) ? `_view_${key}` : key;

  return tranform;
}

function getViewsCode(routeFiles: RouteFile[], options: ContextOption) {
  let preCode = `import type { RouteComponent } from 'vue-router';\n`;
  let code = `
export const views: Record<
  PageRoute.LastDegreeRouteKey,
  RouteComponent | (() => Promise<{ default: RouteComponent }>)
> = {`;

  routeFiles.forEach(({ name, path }, index) => {
    const isLazy = options.lazyImport(name);

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

    if (index < routeFiles.length - 1) {
      code += ',';
    }
  });

  code += '\n};\n';

  return preCode + code;
}

export async function generateViews(routeFiles: RouteFile[], options: ContextOption) {
  const code = getViewsCode(routeFiles, options);

  const filePath = `${options.rootDir}/${options.pageDir}/index.ts`;

  await writeFile(filePath, code, 'utf-8');

  await handleEslintFormat(filePath);
}
