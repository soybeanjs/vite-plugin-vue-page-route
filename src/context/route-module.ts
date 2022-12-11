import { access, writeFile, unlink } from 'fs/promises';
import execa from 'execa';
import {
  getIsRouteModuleFileExist,
  getRouteModuleNameFromGlob,
  getRouteModuleFilePath,
  getRouteModuleFromGlob,
  getRouteModuleItemByRouteName,
  INVALID_ROUTE_NAME
} from '../shared';
import type { ContextOption, RouteModule } from '../types';

async function handleEslintFormat(filePath: string) {
  const eslintBinPath = `${process.cwd()}/node_modules/eslint/bin/eslint.js`;

  try {
    await access(eslintBinPath);

    await execa('node', [eslintBinPath, filePath, '--fix']);
  } catch {
    //
  }
}

async function generateRouteModule(moduleName: string, module: RouteModule, options: ContextOption) {
  const filePath = getRouteModuleFilePath(moduleName, options);

  const code = `const ${moduleName}: ${options.routeModuleDeclaration} = ${JSON.stringify(
    module
  )};\n\nexport default ${moduleName};`;

  await writeFile(filePath, code, 'utf-8');

  await handleEslintFormat(filePath);
}

async function handleRouteModuleWhenFileAdded(glob: string, options: ContextOption, exist: boolean) {
  const moduleName = getRouteModuleNameFromGlob(glob, options);
  const modules = getRouteModuleFromGlob(glob, options);

  const filePath = getRouteModuleFilePath(moduleName, options);

  if (exist && modules.length > 1) {
    const module: RouteModule = (await import(filePath)).default;
    const parentRouteName = modules[modules.length - 2].name;

    const findParentRoute = getRouteModuleItemByRouteName(parentRouteName, module.children || []);
    if (findParentRoute) {
      findParentRoute.children = [...(findParentRoute.children || []), modules[modules.length - 1]];
    }

    await generateRouteModule(moduleName, module, options);
  } else {
    const reverseModules = [...modules].reverse();
    reverseModules.forEach((_, index) => {
      if (index > 0) {
        reverseModules[index].children = [reverseModules[index - 1]];
      }
    });
    const module = reverseModules[reverseModules.length - 1];

    await generateRouteModule(moduleName, module, options);
  }
}

function removeRouteModule(routeName: string, children?: RouteModule[]) {
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

async function handleRouteModuleWhenFileUnlinked(glob: string, options: ContextOption, exist: boolean) {
  const routeName = getRouteModuleNameFromGlob(glob, options);
  const moduleName = getRouteModuleNameFromGlob(glob, options);
  const modules = getRouteModuleFromGlob(glob, options);
  const filePath = getRouteModuleFilePath(moduleName, options);
  if (exist) {
    if (modules.length === 1) {
      unlink(filePath);
    } else {
      const module: RouteModule = (await import(filePath)).default;
      removeRouteModule(routeName, module.children);

      await generateRouteModule(moduleName, module, options);
    }
  }
}

export async function handleRouteModuleFromGlob(glob: string, type: 'add' | 'unlink', options: ContextOption) {
  const routeName = getRouteModuleNameFromGlob(glob, options);
  if (routeName === INVALID_ROUTE_NAME) return;

  const moduleName = getRouteModuleNameFromGlob(glob, options);

  const exist = await getIsRouteModuleFileExist(moduleName, options);

  if (type === 'add') {
    handleRouteModuleWhenFileAdded(glob, options, exist);
  } else {
    handleRouteModuleWhenFileUnlinked(glob, options, exist);
  }
}
