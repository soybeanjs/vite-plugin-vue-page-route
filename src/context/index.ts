import chokidar from 'chokidar';
import { createPluginOptions, getGlobsOfPage, getRouteConfigByGlobs, matchGlob } from '../shared';
import { generateDeclaration } from './declaration';
import { generateViews } from './views';
import { fileWatcherHandler, createFWHooksOfGenDeclarationAndViews, createFWHooksOfGenModule } from './fs';
import type {
  ContextOption,
  PluginOption,
  RouteConfig,
  FileWatcherDispatch,
  FileWatcherHooks,
  FileWatcherEvent
} from '../types';

export default class Context {
  options: ContextOption;

  routeConfig: RouteConfig;

  dispatchId: null | NodeJS.Timeout = null;

  dispatchStack: FileWatcherDispatch[] = [];

  constructor(options: Partial<PluginOption> = {}) {
    const rootDir = process.cwd();

    this.options = createPluginOptions(options, rootDir);

    const globs = getGlobsOfPage(this.options.pageGlobs, this.options.pageDir);

    this.routeConfig = getRouteConfigByGlobs(globs, this.options);

    this.generate();
  }

  private async generate() {
    await generateDeclaration(this.routeConfig, this.options);
    await generateViews(this.routeConfig.files, this.options);
  }

  private createFileWatcherHooks(dispatchs: FileWatcherDispatch[]) {
    const declarationAndViewsHooks = createFWHooksOfGenDeclarationAndViews(dispatchs, this.routeConfig, this.options);
    const moduleHooks = createFWHooksOfGenModule(dispatchs, this.options);

    const hooks: FileWatcherHooks = {
      async onRenameDirWithFile() {
        await declarationAndViewsHooks.onRenameDirWithFile();
        await moduleHooks.onRenameDirWithFile();
      },
      async onDelDirWithFile() {
        await declarationAndViewsHooks.onDelDirWithFile();
        await moduleHooks.onDelDirWithFile();
      },
      async onAddDirWithFile() {
        await declarationAndViewsHooks.onAddDirWithFile();
        await moduleHooks.onAddDirWithFile();
      },
      async onDelFile() {
        await declarationAndViewsHooks.onDelFile();
        await moduleHooks.onDelFile();
      },
      async onAddFile() {
        await declarationAndViewsHooks.onAddFile();
        await moduleHooks.onAddFile();
      }
    };

    return hooks;
  }

  private dispatchFileWatcher(glob: string, event: FileWatcherEvent) {
    const isMatch = matchGlob(glob, this.options);
    if (!isMatch) return;

    this.dispatchStack.push({ event, path: glob });

    if (!this.dispatchId) {
      this.dispatchId = setTimeout(async () => {
        const hooks = this.createFileWatcherHooks(this.dispatchStack);

        await fileWatcherHandler(this.dispatchStack, hooks);

        this.generate();

        this.dispatchStack = [];
        this.dispatchId = null;
      }, 100);
    }
  }

  setupFileWatcher() {
    const events: FileWatcherEvent[] = ['addDir', 'unlinkDir', 'add', 'unlink'];

    events.forEach(event => {
      chokidar
        .watch(['.'], {
          ignoreInitial: true,
          cwd: this.options.pageDir
        })
        .on(event, path => {
          this.dispatchFileWatcher(path, event);
        });
    });
  }
}
