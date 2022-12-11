import fastGlob from 'fast-glob';
import { getRelativePathFromRoot } from './path';
import type { ContextOption } from '../types';

/**
 * get the scan paths of the page file
 * @param options plugin options
 * @translate 获取页面文件的扫描路径
 */
export function getScanPathsOfPageFile(options: ContextOption) {
  const { globFilePattern, excludeDirs, rootDir } = options;

  const pageDir = getRelativePathFromRoot(options.pageDir);

  const paths = globFilePattern.map(pattern => `${rootDir}/${pageDir}/**/${pattern}`);
  const excludes = excludeDirs.map(dir => `!${rootDir}/${pageDir}/**/${dir}`);

  const scanPaths = paths.concat(excludes);

  return scanPaths;
}

/**
 * get the glob of page file
 * @param scanPaths the scaned paths by fastGlob
 */
export function getGlobsOfPageFile(scanPaths: string[], rootDir: string) {
  const globs = fastGlob.sync(scanPaths, {
    onlyFiles: true,
    cwd: rootDir
  });

  return globs;
}

export function checkMatchGlobPath(glob: string, options: ContextOption) {
  const pageDir = getRelativePathFromRoot(options.pageDir);

  let match = glob.includes(`${options.rootDir}/${pageDir}`);

  match = match && options.pageFilePattern.some(pattern => pattern.test(glob));

  match = match && options.ignoreRouteDirs.every(pattern => !pattern.test(glob));

  return match;
}
