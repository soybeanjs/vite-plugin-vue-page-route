import fastGlob from 'fast-glob';
import {
  DEFAULT_PAGE_DIR,
  DEFAULT_EXCLUDE_PAGE_DIRS,
  DEFAULT_DTS,
  DEFAULT_PATTERNS,
  ROOT_ROUTE,
  NOT_FOUND_ROUTE
} from './constant';
import type { Options } from './types';

export function createPluginOptions(opt?: Partial<Options>) {
  const options: Options = {
    dir: DEFAULT_PAGE_DIR,
    excludes: DEFAULT_EXCLUDE_PAGE_DIRS,
    dts: DEFAULT_DTS,
    patterns: DEFAULT_PATTERNS,
    builtinRoute: {
      root: ROOT_ROUTE,
      notFound: NOT_FOUND_ROUTE
    },
    pagesFormatter: names => names
  };

  Object.assign(options, opt);

  return options;
}

export function getScanDir(rootDir: string, options: Options) {
  const { dir, patterns } = options;

  const scanDir = patterns.map(pattern => `${rootDir}/${dir}/**/${pattern}`);

  return scanDir;
}

export function getRouterPageDirs(scanDirs: string[]): string[] {
  const dirs = fastGlob.sync(scanDirs);

  return dirs;
}

function transformDirToName(totalDir: string, rootDir: string, options: Options) {
  const { dir, patterns } = options;

  const PAGE_DEGREE_SPLIT_MARK = '_';

  const prefix = `${rootDir}/${dir}/`;

  let name = totalDir.replace(prefix, '');

  patterns.forEach(pattern => {
    const suffix = `/${pattern}`;

    name = name.replace(suffix, '');

    name = name.replace('/', PAGE_DEGREE_SPLIT_MARK);
  });

  return name;
}

export function transformDirsToNames(dirs: string[], rootDir: string, options: Options) {
  return dirs.map(dir => transformDirToName(dir, rootDir, options));
}
