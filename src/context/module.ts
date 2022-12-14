import { access, writeFile } from 'fs/promises';
import execa from 'execa';
import { getRouteModuleFilePath } from '../shared';
import type { ContextOption, FileWatcherHooks, FileWatcherDispatch, RouteConfig, RouteModule } from '../types';

async function handleEslintFormat(filePath: string) {
  const eslintBinPath = `${process.cwd()}/node_modules/eslint/bin/eslint.js`;

  try {
    await access(eslintBinPath);

    await execa('node', [eslintBinPath, filePath, '--fix']);
  } catch {
    //
  }
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

export function isDeleteWholeModule(deletes: string[], files: string[], moduleName: string) {
  const remains = files.filter(item => !deletes.includes(item));

  return remains.every(item => !item.includes(moduleName));
}

export function createFWHooksOfGenModule(
  _dispatchs: FileWatcherDispatch[],
  _routeConfig: RouteConfig,
  _options: ContextOption
) {
  const hooks: FileWatcherHooks = {
    async onRenameDirWithFile() {
      console.log('onRenameDirWithFile: ');
    },
    async onDelDirWithFile() {
      console.log('onDelDirWithFile: ');
    },
    async onAddDirWithFile() {
      console.log('onAddDirWithFile: ');
    },
    async onDelFile() {
      console.log('onDelFile: ');
    },
    async onAddFile() {
      console.log('onAddFile: ');
    }
  };

  return hooks;
}
