import { access, writeFile, unlink } from 'fs/promises';
import fastGlob from 'fast-glob';
import execa from 'execa';
import {
  DEFAULT_PAGE_DIR,
  DEFAULT_EXCLUDE_PAGE_DIRS,
  DEFAULT_DTS,
  DEFAULT_MODULE_DIR,
  DEFAULT_PATTERNS,
  DEFAULT_IGNORE_DIR_PREFIX,
  ROOT_ROUTE,
  NOT_FOUND_ROUTE,
  PAGE_DEGREE_SPLIT_MARK,
  DEFAULT_MODULE_TYPE_CONST
} from './constant';
import type { Options, ContextOptions, NameWithModule, RouteModule, RouteComponentType } from './types';

export function createPluginOptions(opt?: Partial<Options>) {
  const options: ContextOptions = {
    dir: DEFAULT_PAGE_DIR,
    excludes: DEFAULT_EXCLUDE_PAGE_DIRS,
    dts: DEFAULT_DTS,
    moduleDir: DEFAULT_MODULE_DIR,
    moduleTypeConst: DEFAULT_MODULE_TYPE_CONST,
    patterns: DEFAULT_PATTERNS,
    ignoreDirPrefix: DEFAULT_IGNORE_DIR_PREFIX,
    builtinRoute: {
      root: ROOT_ROUTE,
      notFound: NOT_FOUND_ROUTE
    },
    noLazy: [],
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

export function getNameFromFilePath(path: string, options: ContextOptions) {
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
  const names = [...globs].sort().map(path => {
    const name = getNameFromFilePath(path, options);
    const key = transformIgnoreDir(name, options.ignoreDirPrefix);
    return {
      key,
      module: getModuleStrByGlob(path, options)
    };
  });

  return names;
}

function getRouteModuleFilePath(name: string, options: ContextOptions, fileExtension = '.ts') {
  const { rootDir, moduleDir } = options;

  const prefix = `${rootDir}/${moduleDir}/`;
  const path = prefix + name + fileExtension;

  return path;
}

async function getIsRouteModuleFileExist(name: string, options: ContextOptions) {
  const path = getRouteModuleFilePath(name, options);

  let exist = false;
  try {
    await access(path);
    exist = true;
  } catch {}

  return exist;
}

interface RouteConfig {
  component: RouteComponentType;
  hasSingleLayout: boolean;
}

function getRouteConfig(index: number, length: number) {
  const actions: [boolean, RouteConfig][] = [
    [length === 1, { component: 'self', hasSingleLayout: true }],
    [length === 2 && index === 0, { component: 'basic', hasSingleLayout: false }],
    [length === 2 && index === 1, { component: 'self', hasSingleLayout: false }],
    [length >= 3 && index === 0, { component: 'basic', hasSingleLayout: false }],
    [length >= 3 && index === length - 1, { component: 'self', hasSingleLayout: false }],
    [true, { component: 'multi', hasSingleLayout: false }]
  ];

  const config: RouteConfig = {
    component: 'self',
    hasSingleLayout: false
  };

  const findItem = actions.find(([condition]) => condition);

  return findItem?.[1] || config;
}

function getRoutePathFromName(itemName: string) {
  const PATH_SPLIT_MARK = '/';

  return PATH_SPLIT_MARK + itemName.replace(new RegExp(`${PAGE_DEGREE_SPLIT_MARK}`, 'g'), PATH_SPLIT_MARK);
}

function getRouteModuleByNames(names: string[]) {
  const modules: RouteModule[] = names.map((item, index) => {
    const config = getRouteConfig(index, names.length);

    const module: RouteModule = {
      name: item,
      path: getRoutePathFromName(item),
      component: config.component,
      meta: {
        title: item,
        icon: 'mdi:menu'
      }
    };

    if (config.hasSingleLayout) {
      module.meta.singleLayout = 'basic';
    }

    return module;
  });

  return modules;
}

function removeRoute(routeName: string, children?: RouteModule[]) {
  if (!children || !children.length) return;
  const findIndex = children.findIndex(item => item.name === routeName);

  if (findIndex > -1) {
    children.splice(findIndex, 1);
  } else {
    children.forEach(item => {
      removeRoute(routeName, item.children || []);
    });
  }
}

export async function getRouteModuleFromPath(path: string, type: 'add' | 'unlink', options: ContextOptions) {
  const name = getNameFromFilePath(path, options);
  const names = getNamesWithParent(name);

  if (!names.length) {
    throw new Error(`文件路径解析名字失败: [path]:${path} [name]:${name}`);
  }

  const modules = getRouteModuleByNames(names);

  let code = '';

  const moduleName = names[0];

  const exist = await getIsRouteModuleFileExist(moduleName, options);
  const filePath = getRouteModuleFilePath(moduleName, options);

  // 路由模块文件不存在，只需处理 add情况
  if (!exist && type === 'add') {
    const reverseModules = [...modules].reverse();
    reverseModules.forEach((_, index) => {
      if (index > 0) {
        reverseModules[index].children = [reverseModules[index - 1]];
      }
    });

    const module = reverseModules[reverseModules.length - 1];
    const moduleStr = `const ${moduleName}: ${options.moduleTypeConst} = ${JSON.stringify(
      module
    )};\n\nexport default ${moduleName};`;

    code = moduleStr;

    await writeFile(filePath, code, 'utf-8');

    handleEslintFormat(filePath);
  }

  if (exist) {
    const importData = await import(filePath);
    const route = importData.default as RouteModule;

    if (type === 'unlink') {
      if (names.length === 1) {
        unlink(filePath);
      } else {
        removeRoute(name, route.children);

        const moduleStr = `const ${moduleName}: ${options.moduleTypeConst} = ${JSON.stringify(
          route
        )};\n\nexport default ${moduleName};`;

        code = moduleStr;

        await writeFile(filePath, code, 'utf-8');

        handleEslintFormat(filePath);
      }
    } else {
      //
    }
  }

  return code;
}

export function isViewsFileChange(path: string, options: ContextOptions) {
  const { rootDir, dir, patterns } = options;
  const prefix = `${rootDir}/${dir}/`;
  const isViewsFile = path.includes(prefix);
  const hasPattern = patterns.some(pattern => path.includes(pattern));

  return isViewsFile && hasPattern;
}

async function handleEslintFormat(filePath: string) {
  const eslintBinPath = `${process.cwd()}/node_modules/eslint/bin/eslint.js`;

  try {
    await access(eslintBinPath);

    execa('node', [eslintBinPath, filePath, '--fix']);
  } catch {
    //
  }
}
