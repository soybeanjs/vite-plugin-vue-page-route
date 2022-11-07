import { writeFile } from 'fs/promises';
import type { ContextOptions, NameWithModule } from './types';

export async function writeDeclaration(names: string[], options: ContextOptions) {
  const code = getDeclaration(names, options);

  const filePath = `${options.rootDir}/${options.dts}`;

  await writeFile(filePath, code, 'utf-8');
}

function getDeclaration(names: string[], options: ContextOptions) {
  const { root, notFound } = options.builtinRoute;

  let code = `declare namespace RouterPage {\n  /** 根路由 */\n  type RootRouteKey = '${root}';\n\n  /** 未找到路由(捕获无效路径的路由) */\n  type NotFoundRouteKey = '${notFound}';\n\n  /** 页面路由 */\n  type PageRouteKey =`;

  names.forEach(name => {
    code += `\n    | '${name}'`;
  });
  code += ';\n}\n';

  return code;
}

function getViewComponentsCode(namesWithModules: NameWithModule[]) {
  let code = `export const views = {`;
  namesWithModules.forEach(({ key, module }, index) => {
    code += `\n  ${key}: import('${module}')`;
    if (index < namesWithModules.length - 1) {
      code += ',';
    }
  });
  code += '\n};\n';

  return code;
}

export async function writeViewComponents(namesWithModules: NameWithModule[], options: ContextOptions) {
  const code = getViewComponentsCode(namesWithModules);

  const filePath = `${options.rootDir}/${options.dir}/index.ts`;

  await writeFile(filePath, code, 'utf-8');
}
