import type { FSWatcher } from 'fs';
import {
  createPluginOptions,
  getScanPathsOfPageFile,
  getGlobsOfPageFile,
  getRouteNamesFromGlobs,
  getRouteViewImportsFromGlobs,
  checkMatchGlobPath,
  handleUpdateRouteName,
  handleUpdateRouteViewImport
} from '../shared';
import { generateRouteDeclaraton } from './route-declaration';
import { generateRouteViews } from './route-views';
import { handleRouteModuleFromGlob } from './route-module';
import type { RouteImport, ContextOption, PluginOption, RouteName } from '../types';

export default class Context {
  options: ContextOption;

  routeName: RouteName;

  routeImports: RouteImport[];

  constructor(options: Partial<PluginOption> = {}) {
    const rootDir = process.cwd();
    this.options = createPluginOptions(options, rootDir);

    const globs = this.getSearchGlobs();
    this.routeName = getRouteNamesFromGlobs(globs, this.options);
    this.routeImports = getRouteViewImportsFromGlobs(globs, this.options);

    this.generate();
  }

  private getSearchGlobs() {
    const scanPaths = getScanPathsOfPageFile(this.options);
    const globs = getGlobsOfPageFile(scanPaths, this.options.rootDir).sort();
    return globs;
  }

  private generate() {
    generateRouteDeclaraton(this.routeName, this.options);
    generateRouteViews(this.routeImports, this.options);
  }

  private fileHandler(glob: string, type: 'add' | 'unlink') {
    if (!checkMatchGlobPath(glob, this.options)) return;

    this.routeName = handleUpdateRouteName({ glob, routeName: this.routeName, options: this.options, type });
    this.routeImports = handleUpdateRouteViewImport({
      glob,
      routeImports: this.routeImports,
      options: this.options,
      type
    });

    this.generate();

    handleRouteModuleFromGlob(glob, type, this.options);
  }

  setupFileWatcher(watcher: FSWatcher) {
    watcher.on('add', stream => {
      this.fileHandler(stream, 'add');
    });
    watcher.on('unlink', stream => {
      this.fileHandler(stream, 'unlink');
    });
  }
}
