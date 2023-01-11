import { remove } from 'fs-extra';

import {
  getRenamedDirConfig,
  getDelDirConfig,
  getAddDirConfig,
  getDelFileConfig,
  getAddFileConfig,
  getRouteModuleNameByRouteName,
  getRouteModuleNameByGlob,
  getIsRouteModuleFileExist,
  checkIsValidRouteModule,
  getTotalRouteModuleFromGlobs,
  getSingleRouteModulesFromGlob,
  mergeFirstDegreeRouteModule
} from '../shared';
import type {
  ContextOption,
  RouteConfig,
  FileWatcherDispatch,
  FileWatcherHooks,
  FileWatcherEvent,
  RouteModule
} from '../types';
import { generateRouteModuleCode } from './module';

export async function fileWatcherHandler(dispatchs: FileWatcherDispatch[], hooks: FileWatcherHooks) {
  const dispatchWithCategory: Record<FileWatcherEvent, string[]> = {
    addDir: [],
    unlinkDir: [],
    add: [],
    unlink: []
  };

  dispatchs.forEach(item => {
    dispatchWithCategory[item.event].push(item.path);
  });

  const hasAddDir = dispatchWithCategory.addDir.length > 0;
  const hasUnlinkDir = dispatchWithCategory.unlinkDir.length > 0;
  const hasAdd = dispatchWithCategory.add.length > 0;
  const hasUnlink = dispatchWithCategory.unlink.length > 0;

  const { onRenameDirWithFile, onDelDirWithFile, onAddDirWithFile, onDelFile, onAddFile } = hooks;

  const conditions: [boolean, () => Promise<void>][] = [
    [hasAddDir && hasUnlinkDir && hasAdd && hasUnlink, onRenameDirWithFile],
    [hasUnlinkDir && hasUnlink, onDelDirWithFile],
    [hasAddDir && hasAdd, onAddDirWithFile],
    [hasUnlink, onDelFile],
    [hasAdd, onAddFile]
  ];

  const [, callback] = conditions.find(([condition]) => condition) || [true, async () => {}];

  await callback();
}

export function createFWHooksOfGenDeclarationAndViews(
  dispatchs: FileWatcherDispatch[],
  routeConfig: RouteConfig,
  options: ContextOption
) {
  const hooks: FileWatcherHooks = {
    async onRenameDirWithFile() {
      const { oldRouteName, newRouteName, oldRouteFilePath, newRouteFilePath } = getRenamedDirConfig(
        dispatchs,
        options
      );

      routeConfig.names = routeConfig.names.map(name => name.replace(oldRouteName, newRouteName));

      routeConfig.files = routeConfig.files.map(item => {
        const name = item.name.replace(oldRouteName, newRouteName);
        const path = item.path.replace(oldRouteFilePath, newRouteFilePath);

        return {
          name,
          path
        };
      });
    },
    async onDelDirWithFile() {
      const { delRouteName } = getDelDirConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.filter(name => !name.includes(delRouteName));
      routeConfig.files = routeConfig.files.filter(item => !item.name.includes(delRouteName));
    },
    async onAddDirWithFile() {
      const config = getAddDirConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.concat(config.names).sort();
      routeConfig.files = routeConfig.files.concat(config.files).sort((a, b) => (a.name > b.name ? 1 : -1));
    },
    async onDelFile() {
      const { delRouteNames } = getDelFileConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.filter(name => delRouteNames.every(item => !name.includes(item)));
      routeConfig.files = routeConfig.files.filter(item => delRouteNames.every(v => !item.name.includes(v)));
    },
    async onAddFile() {
      const config = getAddFileConfig(dispatchs, options);

      routeConfig.names = routeConfig.names.concat(config.names).sort();
      routeConfig.files = routeConfig.files.concat(config.files).sort((a, b) => (a.name > b.name ? 1 : -1));
    }
  };

  return hooks;
}

export function createFWHooksOfGenModule(dispatchs: FileWatcherDispatch[], options: ContextOption) {
  const hooks: FileWatcherHooks = {
    async onRenameDirWithFile() {
      const { oldRouteName, newRouteName } = getRenamedDirConfig(dispatchs, options);

      const oldModuleName = getRouteModuleNameByRouteName(oldRouteName);
      const newModuleName = getRouteModuleNameByRouteName(newRouteName);

      const { exist, filePath } = await getIsRouteModuleFileExist(oldModuleName, options);

      let module: RouteModule;

      function addModule() {
        const globs = dispatchs.filter(dispatch => dispatch.event === 'add').map(dispatch => dispatch.path);
        module = getTotalRouteModuleFromGlobs(globs, options);
      }

      try {
        if (exist) {
          const importModule = (await import(filePath)).default;

          if (checkIsValidRouteModule(importModule)) {
            const moduleJson = JSON.stringify(importModule);
            const updateModuleJson = moduleJson.replace(oldRouteName, newRouteName);
            module = JSON.parse(updateModuleJson) as RouteModule;
          }

          await remove(filePath);
        }
      } catch {
        addModule();
      }

      if (!module!) {
        addModule();
      }

      await generateRouteModuleCode(newModuleName, module!, options);
    },
    async onDelDirWithFile() {
      // const { delRouteName } = getDelDirConfig(dispatchs, options);
      // const moduleName = getAllRouteNames(delRouteName)[0];
      // const { exist, filePath } = await getIsRouteModuleFileExist(moduleName, options);
      // let module: RouteModule;
    },
    async onAddDirWithFile() {
      const globs = dispatchs.filter(dispatch => dispatch.event === 'add').map(dispatch => dispatch.path);

      const moduleName = getRouteModuleNameByGlob(globs[0], options);

      const { exist, filePath } = await getIsRouteModuleFileExist(moduleName, options);

      let module: RouteModule;

      function addModule() {
        module = getTotalRouteModuleFromGlobs(globs, options);
      }

      try {
        if (exist) {
          const importModule = (await import(filePath)).default;

          if (checkIsValidRouteModule(importModule)) {
            const moduleJson = JSON.stringify(importModule);
            module = JSON.parse(moduleJson) as RouteModule;

            globs.forEach(glob => {
              const modules = getSingleRouteModulesFromGlob(glob, options);
              mergeFirstDegreeRouteModule(module, modules);
            });
          }
        }
      } catch {
        addModule();
      }

      if (!module!) {
        addModule();
      }

      await generateRouteModuleCode(moduleName, module!, options);
    },
    async onDelFile() {},
    async onAddFile() {
      await this.onAddDirWithFile();
    }
  };

  return hooks;
}
