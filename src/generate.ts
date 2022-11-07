import { writeFile } from 'fs/promises';
import type { ContextOptions, NameWithModule } from './types';

export async function writeDeclaration(names: string[], namesWithFile: string[], options: ContextOptions) {
  const code = getDeclaration(names, namesWithFile, options);

  const filePath = `${options.rootDir}/${options.dts}`;

  await writeFile(filePath, code, 'utf-8');
}

function getDeclaration(names: string[], namesWithFile: string[], options: ContextOptions) {
  const { root, notFound } = options.builtinRoute;

  let code = `declare namespace RouterPage {\n  /** 根路由 */\n  type RootRouteKey = '${root}';\n\n  /** 未找到路由(捕获无效路径的路由) */\n  type NotFoundRouteKey = '${notFound}';\n\n  /** 页面路由 */\n  type RouteKey =`;

  names.forEach(name => {
    code += `\n    | '${name}'`;
  });

  code += ';';

  code += `\n\n  /** 最后一级路由(该级路有对应的vue文件) */\n  type LastDegreeRouteKey = Extract<RouteKey, ${namesWithFile
    .map(item => `'${item}'`)
    .join(' | ')}>`;

  code += '\n}\n';

  return code;
}

function getViewComponentsCode(namesWithModules: NameWithModule[], options: ContextOptions) {
  let importStatement = `import type { RouteComponent } from 'vue-router';\n`;

  const checkIsNotLazy = (name: string) => options.notLazyRoutes.findIndex(item => item === name) > -1;

  const isNumberKey = (name: string) => {
    const NUM_REG = /^\d+$/;
    return NUM_REG.test(name);
  };

  const hasShortLine = (name: string) => name.includes('-');

  const formatKey = (name: string) => (hasShortLine(name) ? `'${name}'` : name);

  const formatImportKey = (name: string) => (hasShortLine(name) ? name.replace(/-/g, '') : name);

  let code = `\nexport const views: Record<RouterPage.LastDegreeRouteKey, RouteComponent | (() => Promise<RouteComponent>)> = {`;
  namesWithModules.forEach(({ key, module }, index) => {
    const isNotLazy = checkIsNotLazy(key);

    if (isNotLazy) {
      const formatedKey = formatKey(key);

      const importKey = isNumberKey(key) ? `_view_${key}` : key;

      const formatedImportKey = formatImportKey(importKey);

      importStatement += `import ${formatedImportKey} from '${module}';\n`;

      if (formatedKey === key && !isNumberKey(key)) {
        code += `\n  ${key}`;
      } else {
        code += `\n  ${formatedKey}: ${formatedImportKey}`;
      }
    } else {
      code += `\n  ${formatKey(key)}: () => import('${module}')`;
    }

    if (index < namesWithModules.length - 1) {
      code += ',';
    }
  });
  code += '\n};\n';

  return importStatement + code;
}

export async function writeViewComponents(namesWithModules: NameWithModule[], options: ContextOptions) {
  const code = getViewComponentsCode(namesWithModules, options);

  const filePath = `${options.rootDir}/${options.dir}/index.ts`;

  await writeFile(filePath, code, 'utf-8');
}
