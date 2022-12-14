import { access } from 'fs/promises';
import { red, bgRed, green, bgYellow, yellow } from 'kolorist';
import { SPLASH_MARK, PAGE_DEGREE_SPLIT_MARK, ROUTE_NAME_REG, INVALID_ROUTE_NAME, CAMEL_OR_PASCAL } from './constant';
import { getRelativePathOfGlob } from './glob';
import type { ContextOption, RouteConfig, RouteModule, RouteComponentType, FileWatcherDispatch } from '../types';

function transformRouteName(glob: string, routeName: string, pageDir: string) {
  let name = routeName;

  const filePath = getRelativePathOfGlob(glob, pageDir);

  if (CAMEL_OR_PASCAL.test(routeName)) {
    let warning = `${bgYellow('RECOMMEND')} `;
    warning += yellow(`the filePath: ${filePath}`);
    warning += green(`\n it's recommended to use kebab-case name style`);
    warning += green(`\n example: good: user-info bad: userInfo, UserInfo`);
    // eslint-disable-next-line no-console
    console.info(warning);
  }

  if (!ROUTE_NAME_REG.test(name)) {
    name = INVALID_ROUTE_NAME;

    let error = `${bgRed('ERROR')} `;
    error += red(`the path is invalid: ${filePath} !\n`);
    error += red(`routeName: ${routeName} !`);
    error += green(
      `\n the directory name and file name can only include letter[a-zA-Z], number[0-9], underline[_] and dollar[$]`
    );
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return name;
}

function getRouteNameByGlob(glob: string, pageDir: string) {
  const globSplits = glob.split(SPLASH_MARK);

  const isFile = glob.includes('.');
  const sliceLength = isFile ? globSplits.length - 1 : globSplits.length;

  const routeName = globSplits.splice(0, sliceLength).join(PAGE_DEGREE_SPLIT_MARK);

  return transformRouteName(glob, routeName, pageDir);
}

function getAllRouteNames(routeName: string) {
  const names = routeName.split(PAGE_DEGREE_SPLIT_MARK);

  const namesWithParent: string[] = [];

  for (let i = 1; i <= names.length; i += 1) {
    const parentName = names.slice(0, i).reduce((pre, cur) => pre + PAGE_DEGREE_SPLIT_MARK + cur);
    namesWithParent.push(parentName);
  }

  return namesWithParent;
}

export function getRouteFilePathByGlob(glob: string) {
  return `./${glob}`;
}

export function getRouteNameByGlobWithTransformer(glob: string, options: ContextOption) {
  const routeName = getRouteNameByGlob(glob, options.pageDir);
  return options.routeNameTansformer(routeName);
}

export function getRouteConfigByGlobs(globs: string[], options: ContextOption) {
  const config: RouteConfig = {
    names: [],
    files: []
  };

  globs.sort().forEach(glob => {
    const routeName = getRouteNameByGlob(glob, options.pageDir);

    const names = getAllRouteNames(routeName);
    config.names.push(...names);

    const filePath = getRouteFilePathByGlob(glob);
    config.files.push({ name: routeName, path: filePath });
  });

  config.names = Array.from(new Set([...config.names]))
    .map(name => options.routeNameTansformer(name))
    .filter(name => Boolean(name) && name !== INVALID_ROUTE_NAME);

  config.files = config.files
    .map(({ name, path }) => ({ name: options.routeNameTansformer(name), path }))
    .filter(item => item.name !== INVALID_ROUTE_NAME);

  return config;
}

interface RouteModuleConfig {
  component: RouteComponentType;
  hasSingleLayout: boolean;
}
function getRouteConfig(index: number, length: number) {
  const actions: [boolean, RouteModuleConfig][] = [
    [length === 1, { component: 'self', hasSingleLayout: true }],
    [length === 2 && index === 0, { component: 'basic', hasSingleLayout: false }],
    [length === 2 && index === 1, { component: 'self', hasSingleLayout: false }],
    [length >= 3 && index === 0, { component: 'basic', hasSingleLayout: false }],
    [length >= 3 && index === length - 1, { component: 'self', hasSingleLayout: false }],
    [true, { component: 'multi', hasSingleLayout: false }]
  ];

  const config: RouteModuleConfig = {
    component: 'self',
    hasSingleLayout: false
  };

  const findItem = actions.find(([condition]) => condition);

  return findItem?.[1] || config;
}

function getRoutePathFromName(routeName: string) {
  const PATH_SPLIT_MARK = '/';

  return PATH_SPLIT_MARK + routeName.replace(new RegExp(`${PAGE_DEGREE_SPLIT_MARK}`, 'g'), PATH_SPLIT_MARK);
}

export function getRouteModuleNameByGlob(glob: string, options: ContextOption) {
  const routeName = getRouteNameByGlob(glob, options.pageDir);
  const routeNames = getAllRouteNames(routeName);

  if (!routeNames.length) {
    throw new Error(`文件路径解析名字失败: [path]:${glob} [name]:${routeName}`);
  }

  return routeNames[0];
}

export function getRouteModuleFromGlob(glob: string, options: ContextOption) {
  const routeName = getRouteNameByGlob(glob, options.pageDir);
  const routeNames = getAllRouteNames(routeName);

  const modules: RouteModule[] = routeNames.map((item, index) => {
    const config = getRouteConfig(index, routeNames.length);

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

export function getRouteModuleFilePath(moduleName: string, options: ContextOption) {
  const { rootDir, routeModuleDir } = options;

  const filePath = `${rootDir}/${routeModuleDir}/${moduleName}.ts`;

  return filePath;
}

export async function getIsRouteModuleFileExist(moduleName: string, options: ContextOption) {
  const path = getRouteModuleFilePath(moduleName, options);

  let exist = false;
  try {
    await access(path);
    exist = true;
  } catch {}

  return exist;
}

export function getRouteModuleItemByRouteName(routeName: string, modules: RouteModule[]) {
  const findItem = modules.find(item => item.name === routeName);

  if (findItem) {
    return findItem;
  }

  let result: RouteModule | null = null;

  modules.forEach(module => {
    if (module.children) {
      result = getRouteModuleItemByRouteName(routeName, module.children);
    }
  });

  return result;
}

function getTheSmallLengthOfStrArr(arr: string[]) {
  let name: string = arr[0];

  arr.forEach(item => {
    if (name === null) {
      name = item;
    } else {
      name = item.length < name.length ? item : name;
    }
  });

  return name;
}

export function getRenamedDirConfig(dispatchs: FileWatcherDispatch[], options: ContextOption) {
  const unlinkDirs: string[] = [];
  const addDirs: string[] = [];

  dispatchs.forEach(dispatch => {
    if (dispatch.event === 'unlinkDir') {
      unlinkDirs.push(dispatch.path);
    }
    if (dispatch.event === 'addDir') {
      addDirs.push(dispatch.path);
    }
  });

  const oldDir = getTheSmallLengthOfStrArr(unlinkDirs);
  const newDir = getTheSmallLengthOfStrArr(addDirs);

  const oldRouteName = getRouteNameByGlobWithTransformer(oldDir, options);
  const oldRouteFilePath = getRouteFilePathByGlob(oldDir);

  const newRouteName = getRouteNameByGlobWithTransformer(newDir, options);
  const newRouteFilePath = getRouteFilePathByGlob(newDir);

  return {
    oldRouteName,
    newRouteName,
    oldRouteFilePath,
    newRouteFilePath
  };
}
