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
  const { rootDir, dir, patterns, excludes } = options;

  const scanDir = patterns.map(pattern => `${rootDir}/${dir}/**/${pattern}`);

  const excludeDirs: string[] = excludes.map(item => `!${rootDir}/${dir}/**/${item}`);

  return scanDir.concat(excludeDirs);
}

export function getRouterPageDirs(scanDirs: string[], options: ContextOptions): string[] {
  const dirs = fastGlob.sync(scanDirs, {
    ignore: ['node_modules'],
    onlyFiles: true,
    cwd: options.rootDir,
    absolute: true
  });

  return dirs;
}

const PAGE_DEGREE_SPLIT_MARK = '_';

function getNameFromFilePath(path: string, options: ContextOptions) {
  const { rootDir, dir, patterns } = options;

  const prefix = `${rootDir}/${dir}/`;

  let name = path.replace(prefix, '');

  patterns.forEach(pattern => {
    const suffix = `/${pattern}`;

    name = name.replace(suffix, '');

    name = name.replace(/\//g, PAGE_DEGREE_SPLIT_MARK);
  });

  return name;
}

function getParentNameByName(name: string) {
  const names = name.split(PAGE_DEGREE_SPLIT_MARK);

  const namesWithParent: string[] = [];

  for (let i = 1; i <= names.length; i += 1) {
    namesWithParent.push(names.slice(0, i).reduce((pre, cur) => pre + PAGE_DEGREE_SPLIT_MARK + cur));
  }

  return namesWithParent;
}

export function getNamesFromFilePaths(globs: string[], options: ContextOptions) {
  const names = globs.map(path => getNameFromFilePath(path, options)).sort();

  const allNames: string[] = [];

  names.forEach(name => {
    allNames.push(...getParentNameByName(name));
  });

  allNames.sort();

  const result = [...new Set(allNames)];

  return result;
}
