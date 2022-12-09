import fastGlob from 'fast-glob';
import { getRelativePathFromRoot } from './path';
import type { PluginOption } from '../types';

/**
 * get the scan paths of the page file
 * @param options plugin options
 * @translate 获取页面文件的扫描路径
 */
export function getScanPathsOfPageFile(options: PluginOption) {
  const { pageFilePattern, excludeDirs } = options;

  const rootDir = process.cwd();
  const pageDir = getRelativePathFromRoot(options.pageDir);

  const paths = pageFilePattern.map(pattern => `${rootDir}/${pageDir}/**/${pattern}`);
  const excludes = excludeDirs.map(dir => `!${rootDir}/${pageDir}/**/${dir}`);

  const scanPaths = paths.concat(excludes);

  return scanPaths;
}

/**
 * get the glob of page file
 * @param scanPaths
 * @param options
 */
export function getGlobsOfPageFile(scanPaths: string[]) {
  const rootDir = process.cwd();

  const globs = fastGlob.sync(scanPaths, {
    onlyFiles: true,
    cwd: rootDir
  });

  return globs;
}
