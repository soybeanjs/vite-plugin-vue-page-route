import fastGlob from 'fast-glob';
import type { PluginOption } from '../types';

/**
 * get the scan paths of the page file
 * @param options plugin options
 * @translate 获取页面文件的扫描路径
 */
export function getScanPathsOfPageFile(options: PluginOption) {
  const rootDir = process.cwd();
  const { pageFilePattern, excludeDirs } = options;

  const pageDir = getPageDir(options.pageDir, rootDir);

  const paths = pageFilePattern.map(pattern => `${rootDir}/${pageDir}/**/${pattern}`);
  const excludes = excludeDirs.map(dir => `!${rootDir}/${pageDir}/**/${dir}`);

  const scanPaths = paths.concat(excludes);

  return scanPaths;
}

function getPageDir(dir: string, rootDir: string) {
  const containRootDir = dir.includes(rootDir);

  if (containRootDir) {
    return dir.replace(`${rootDir}/`, '');
  }

  const isAbsolutePath = dir.startsWith('/');

  if (isAbsolutePath) {
    return dir.slice(1);
  }

  const isRelativePath = dir.startsWith('./');

  if (isRelativePath) {
    return dir.slice(2);
  }

  return dir;
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
