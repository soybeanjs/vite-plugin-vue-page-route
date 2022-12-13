import chokidar from 'chokidar';
import {
  createPluginOptions,
  getRelativePathFromRoot,
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
import { generateRouteModule } from './route-module';
import { fileWatcherHandler } from './file-watcher';
import type {
  RouteImport,
  ContextOption,
  PluginOption,
  RouteName,
  FileWatcherEvent,
  FileWatcherDispatch
} from '../types';

export default class Context {
  options: ContextOption;

  routeName: RouteName;

  routeImports: RouteImport[];

  dispatchId: null | NodeJS.Timeout = null;

  dispatchStack: FileWatcherDispatch[] = [];

  dispatchAddGlobs: string[] = [];

  dispatchUnlinkGlobs: string[] = [];

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

  private async generate() {
    await generateRouteDeclaraton(this.routeName, this.options);
    await generateRouteViews(this.routeImports, this.options);
  }

  private dispatchFileWatcher1(glob: string, type: 'add' | 'unlink') {
    if (type === 'add') {
      this.dispatchAddGlobs.push(glob);
    } else {
      this.dispatchUnlinkGlobs.push(glob);
    }
    if (!this.dispatchId) {
      this.dispatchId = setTimeout(async () => {
        await this.update(this.dispatchUnlinkGlobs, 'unlink');
        this.dispatchUnlinkGlobs = [];

        await this.update(this.dispatchAddGlobs, 'add');
        this.dispatchAddGlobs = [];

        this.dispatchId = null;
      }, 100);
    }
  }

  private async update(globs: string[], type: 'add' | 'unlink') {
    const lastDegree = [...this.routeName.lastDegree];

    const validGlobs = globs.filter(glob => checkMatchGlobPath(glob, this.options));

    if (!validGlobs.length) return;

    this.routeName = handleUpdateRouteName({
      globs: validGlobs,
      routeName: this.routeName,
      options: this.options,
      type
    });
    this.routeImports = handleUpdateRouteViewImport({
      globs,
      routeImports: this.routeImports,
      options: this.options,
      type
    });

    await this.generate();

    await generateRouteModule({ globs, type, options: this.options, lastDegree });
  }

  private dispatchFileWatcher(glob: string, event: FileWatcherEvent) {
    this.dispatchStack.push({ event, path: glob });
    if (!this.dispatchId) {
      this.dispatchId = setTimeout(async () => {
        console.log('this.dispatchStack: ', this.dispatchStack);
        await fileWatcherHandler(this.dispatchStack, {
          async onRenameDirectoryWithFile() {
            console.log('onRenameDirectoryWithFile: ');
          },
          async onDeleteDirectoryWithFile() {
            console.log('onDeleteDirectoryWithFile: ');
          },
          async onAddDirectoryWithFile() {
            console.log('onAddDirectoryWithFile: ');
          },
          async onDeleteFile() {
            console.log('onDeleteFile: ');
          },
          async onAddFile() {
            console.log('onAddFile: ');
          }
        });

        this.dispatchStack = [];
        this.dispatchId = null;
      }, 200);
    }
  }

  setupFileWatcher() {
    const pageDir = getRelativePathFromRoot(this.options.pageDir);

    const events: FileWatcherEvent[] = ['addDir', 'unlinkDir', 'add', 'unlink'];

    events.forEach(event => {
      chokidar
        .watch(pageDir, {
          ignoreInitial: true
        })
        .on(event, path => {
          this.dispatchFileWatcher(path, event);
        });
    });
  }
}
