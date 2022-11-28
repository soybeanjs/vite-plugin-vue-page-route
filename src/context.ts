import type { FSWatcher } from 'fs';
import {
  createPluginOptions,
  getScanDir,
  getRouterPageDirs,
  getNamesFromFilePaths,
  isViewsFileChange,
  getNamesWithModule
} from './utils';
import { writeDeclaration, writeViewComponents, writeModuleCode } from './generate';
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

  private generateModuleCode(path: string, type: 'add' | 'unlink') {
    if (!isViewsFileChange(path, this.options)) return;

    writeModuleCode(path, type, this.options);
  }

  private generate() {
    this.searchGlobs();
    this.generateDeclaration();
    this.generateViewComponents();
  }

  setupFileWatcher(watcher: FSWatcher) {
    watcher.on('add', stream => {
      this.generate();
      this.generateModuleCode(stream, 'add');
    });
    watcher.on('unlink', stream => {
      this.generate();
      this.generateModuleCode(stream, 'unlink');
    });
  }
}
