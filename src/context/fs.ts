import {
  getRenamedDirConfig,
  getDelDirConfig,
  getAddDirConfig,
  getDelFileConfig,
  getAddFileConfig,
  getAllRouteNames,
  getIsRouteModuleFileExist,
  checkIsValidRouteModule
} from '../shared';
import type {
  ContextOption,
  RouteConfig,
  FileWatcherDispatch,
  FileWatcherHooks,
  FileWatcherEvent,
  RouteModule
} from '../types';
// import { generateRouteModuleCode } from './module';

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

      const moduleName = getAllRouteNames(oldRouteName)[0];
      const { exist, filePath } = await getIsRouteModuleFileExist(moduleName, options);

      if (exist) {
        const importModule = (await import(filePath)).default;

        if (checkIsValidRouteModule(importModule)) {
          const moduleJson = JSON.stringify(importModule);
          const updateModuleJson = moduleJson.replace(oldRouteName, newRouteName);
          const module = JSON.parse(updateModuleJson) as RouteModule;
          console.log('module: ', module);
        }
      }
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
