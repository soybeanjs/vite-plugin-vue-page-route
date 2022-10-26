import { writeFile } from 'fs/promises';
import { getScanDir, getRouterPageDirs, transformDirsToNames } from './utils';
import type { Options } from './types';

export function generateDeclaration(rootDir: string, options: Options) {
  const scanDir = getScanDir(rootDir, options);

  const dirs = getRouterPageDirs(scanDir);

  const names = transformDirsToNames(dirs, rootDir, options);

  const formateNames = options.pagesFormatter(names);

  writeDeclaration(formateNames, rootDir, options);
}

async function writeDeclaration(names: string[], rootDir: string, options: Options) {
  const code = getDeclaration(names, options);

  const filePath = `${rootDir}/${options.dts}`;
  await writeFile(filePath, code, 'utf-8');
}

function getDeclaration(names: string[], options: Options) {
  const { root, notFound } = options.builtinRoute;

  let code = `declare namespace RouterPage {\n  /** 根路由 */\n  type RootRouteKey = '${root}';\n\n  /** 未找到路由(捕获无效路径的路由) */\n  type NotFoundRouteKey = '${notFound}';\n\n  /** 页面路由 */\n  type PageRouteKey =`;

  names.forEach(name => {
    code += `\n    | '${name}'`;
  });
  code += ';\n}';

  return code;
}
