import chokidar from 'chokidar';
import { isMatch } from 'micromatch';
import { createPluginOptions, getGlobsOfPage, getRouteConfigByGlobs } from '../shared';
import { generateDeclaration } from './declaration';
import { generateViews } from './views';
import { fileWatcherHandler } from './fs';
import type { ContextOption, PluginOption, RouteConfig, FileWatcherDispatch, FileWatcherEvent } from '../types';

export default class Context {
  options: ContextOption;

  routeConfig: RouteConfig;

  dispatchId: null | NodeJS.Timeout = null;

  dispatchStack: FileWatcherDispatch[] = [];

  constructor(options: Partial<PluginOption> = {}) {
    const rootDir = process.cwd();

    this.options = createPluginOptions(options, rootDir);

    const globs = getGlobsOfPage(this.options.pageGlob, this.options.pageDir);

    this.routeConfig = getRouteConfigByGlobs(globs, this.options);

    this.generate();
  }

  private async generate() {
    await generateDeclaration(this.routeConfig, this.options);
    await generateViews(this.routeConfig.files, this.options);
  }

  private matchGlob(glob: string) {
    const isFile = isMatch(glob, '**/*.*');
    const { pageGlob } = this.options;

    const patterns = isFile ? pageGlob : pageGlob.filter(pattern => !pattern.includes('.'));

    return patterns.every(pattern => isMatch(glob, pattern));
  }

  private dispatchFileWatcher(glob: string, event: FileWatcherEvent) {
    if (!this.matchGlob(glob)) return;

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
