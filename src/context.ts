import type { FSWatcher } from 'fs';
import { createPluginOptions, getScanDir, getRouterPageDirs, getNamesFromFilePaths } from './utils';
import { writeDeclaration } from './declaration';
import type { ContextOptions, Options } from './types';

export class Context {
  options: ContextOptions;

  scanDir: string[] = [];

  globs: string[] = [];

  constructor(options?: Partial<Options>) {
    this.options = createPluginOptions(options);
  }

  init(rootDir: string) {
    this.setRootDir(rootDir);
    this.setScanDir();
    this.generate();
  }

  private setRootDir(path: string) {
    this.options.rootDir = path;
  }

  private setScanDir() {
    this.scanDir = getScanDir(this.options);
  }

  private searchGlobs() {
    this.globs = getRouterPageDirs(this.scanDir, this.options.rootDir);
  }

  private generateDeclaration() {
    const names = getNamesFromFilePaths(this.globs, this.options);
    const formatterNames = this.options.pagesFormatter(names);
    writeDeclaration(formatterNames, this.options);
  }

  private generate() {
    this.searchGlobs();
    this.generateDeclaration();
  }

  setupFileWatcher(watcher: FSWatcher) {
    watcher.on('add', () => {
      this.generate();
    });
    watcher.on('unlink', () => {
      this.generate();
    });
  }
}
