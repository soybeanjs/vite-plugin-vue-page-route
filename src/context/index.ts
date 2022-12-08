import { createPluginOptions, getScanPathsOfPageFile, getGlobsOfPageFile } from '../shared';
import type { PluginOption } from '../types';

export default class PageRoute {
  options: PluginOption;

  scanPaths: string[] = [];

  globs: string[] = [];

  constructor(options?: Partial<PluginOption>) {
    this.options = createPluginOptions(options);
    this.init();
  }

  init() {
    this.getScanPaths();
    this.searchGlobs();
  }

  private getScanPaths() {
    this.scanPaths = getScanPathsOfPageFile(this.options);
  }

  private searchGlobs() {
    this.globs = getGlobsOfPageFile(this.scanPaths);
    console.log('this.scanPaths: ', this.scanPaths);
    console.log('this.globs: ', this.globs);
  }
}
