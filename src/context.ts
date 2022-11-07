import type { FSWatcher } from 'fs';
import { createPluginOptions, getScanDir, getRouterPageDirs, getNamesFromFilePaths, getNamesWithModule } from './utils';
import { writeDeclaration, writeViewComponents } from './generate';
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
    this.generateDts();
    this.generateViewComponents();
  }

  private setRootDir(path: string) {
    this.options.rootDir = path;
  }

  private setScanDir() {
    this.scanDir = getScanDir(this.options);
  }

  private searchGlobs() {
    this.globs = getRouterPageDirs(this.scanDir, this.options);
  }

  private generateDeclaration() {
    const { names, namesWithFile } = getNamesFromFilePaths(this.globs, this.options);
    const formatedNames = this.options.pagesFormatter(names);
    const formatedNamesWithFile = this.options.pagesFormatter(namesWithFile);

    writeDeclaration(formatedNames, formatedNamesWithFile, this.options);
  }

  private generateViewComponents() {
    const namesWithModule = getNamesWithModule(this.globs, this.options);
    writeViewComponents(namesWithModule, this.options);
  }

  private generateDts() {
    this.searchGlobs();
    this.generateDeclaration();
  }

  setupFileWatcher(watcher: FSWatcher) {
    watcher.on('add', () => {
      this.generateDts();
    });
    watcher.on('unlink', () => {
      this.generateDts();
    });
  }
}
