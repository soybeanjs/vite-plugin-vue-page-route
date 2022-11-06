import fastGlob from 'fast-glob';
import {
  DEFAULT_PAGE_DIR,
  DEFAULT_EXCLUDE_PAGE_DIRS,
  DEFAULT_DTS,
  DEFAULT_PATTERNS,
  ROOT_ROUTE,
  NOT_FOUND_ROUTE
} from './constant';
import type { Options, ContextOptions } from './types';

export function createPluginOptions(opt?: Partial<Options>) {
  const options: ContextOptions = {
    dir: DEFAULT_PAGE_DIR,
    excludes: DEFAULT_EXCLUDE_PAGE_DIRS,
    dts: DEFAULT_DTS,
    patterns: DEFAULT_PATTERNS,
    builtinRoute: {
      root: ROOT_ROUTE,
      notFound: NOT_FOUND_ROUTE
    },
    pagesFormatter: names => names,
    rootDir: process.cwd()
  };

  Object.assign(options, opt);

  return options;
}

export function getScanDir(options: ContextOptions) {
  const { rootDir, dir, patterns } = options;

  const scanDir = patterns.map(pattern => `${rootDir}/${dir}/**/${pattern}`);

  return scanDir;
}

export function getRouterPageDirs(scanDirs: string[], rootDir: string): string[] {
  const dirs = fastGlob.sync(scanDirs, {
    ignore: ['node_modules'],
    onlyFiles: true,
    cwd: rootDir,
    absolute: true
  });

  return dirs;
}

function getNameFromFilePath(path: string, options: ContextOptions) {
  const { rootDir, dir, patterns } = options;

  const PAGE_DEGREE_SPLIT_MARK = '_';

  const prefix = `${rootDir}/${dir}/`;

  let name = path.replace(prefix, '');

  patterns.forEach(pattern => {
    const suffix = `/${pattern}`;

    name = name.replace(suffix, '');

    name = name.replace('/', PAGE_DEGREE_SPLIT_MARK);
  });

  return name;
}

export function getNamesFromFilePaths(globs: string[], options: ContextOptions) {
  return globs.map(path => getNameFromFilePath(path, options));
}
