import fastGlob from 'fast-glob';
import {
  DEFAULT_PAGE_DIR,
  DEFAULT_EXCLUDE_PAGE_DIRS,
  DEFAULT_DTS,
  DEFAULT_PATTERNS,
  DEFAULT_IGNORE_DIR_PREFIX,
  ROOT_ROUTE,
  NOT_FOUND_ROUTE
} from './constant';
import type { Options, ContextOptions, NameWithModule } from './types';

export function createPluginOptions(opt?: Partial<Options>) {
  const options: ContextOptions = {
    dir: DEFAULT_PAGE_DIR,
    excludes: DEFAULT_EXCLUDE_PAGE_DIRS,
    dts: DEFAULT_DTS,
    patterns: DEFAULT_PATTERNS,
    ignoreDirPrefix: DEFAULT_IGNORE_DIR_PREFIX,
    builtinRoute: {
      root: ROOT_ROUTE,
      notFound: NOT_FOUND_ROUTE
    },
    notLazyRoutes: [],
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

function getNamesWithParent(name: string) {
  const names = name.split(PAGE_DEGREE_SPLIT_MARK);

  const namesWithParent: string[] = [];

  for (let i = 1; i <= names.length; i += 1) {
    namesWithParent.push(names.slice(0, i).reduce((pre, cur) => pre + PAGE_DEGREE_SPLIT_MARK + cur));
  }

  return namesWithParent;
}

/** 转换需要忽略的目录 */
function transformIgnoreDir(name: string, ignoreDirPrefix: string) {
  let result = name;
  if (name.startsWith(ignoreDirPrefix)) {
    const [, ignoreDir] = name.split(ignoreDirPrefix);

    result = name.replace(ignoreDirPrefix + ignoreDir + PAGE_DEGREE_SPLIT_MARK, '');
  }

  return result;
}

function getTransformedNames(globs: string[], options: ContextOptions) {
  const names = globs.map(path => {
    const name = getNameFromFilePath(path, options);
    return transformIgnoreDir(name, options.ignoreDirPrefix);
  });

  return names;
}

export function getNamesFromFilePaths(globs: string[], options: ContextOptions) {
  const namesWithFile = getTransformedNames(globs, options).sort();

  const allNames: string[] = [];

  namesWithFile.forEach(name => {
    allNames.push(...getNamesWithParent(name));
  });

  allNames.sort();

  const names = [...new Set(allNames.filter(Boolean))];

  return {
    names,
    namesWithFile
  };
}

function getModuleStrByGlob(glob: string, options: ContextOptions) {
  const { rootDir, dir } = options;

  const prefix = `${rootDir}/${dir}/`;

  const module = `./${glob.replace(prefix, '')}`;

  return module;
}

export function getNamesWithModule(globs: string[], options: ContextOptions): NameWithModule[] {
  const names = globs.map(path => {
    const name = getNameFromFilePath(path, options);
    const key = transformIgnoreDir(name, options.ignoreDirPrefix);
    return {
      key,
      module: getModuleStrByGlob(path, options)
    };
  });

  return names;
}
