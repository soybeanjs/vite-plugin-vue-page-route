import { access } from 'fs/promises';
import { getRelativePathFromRoot, createInvalidNameError, createRecommendName } from './path';
import { PAGE_DEGREE_SPLIT_MARK, ROUTE_NAME_REG, INVALID_ROUTE_NAME, CAMEL_OR_PASCAL } from './constant';
import type { ContextOption, RouteName, RouteImport, RouteModule, RouteComponentType } from '../types';

export function getRouteNameFromGlob(glob: string, options: ContextOption) {
  const { rootDir, pageFilePattern, ignoreRouteDirs } = options;

  const pageDir = getRelativePathFromRoot(options.pageDir);

  const prefix = `${rootDir}/${pageDir}/`;

  const filePath = glob.replace(prefix, '');

  let routeName = filePath;

  pageFilePattern.forEach(pattern => {
    routeName = routeName.replace(pattern, '');

    routeName = routeName
      .split('/')
      .filter(item => {
        let name = item;
        if (name) {
          ignoreRouteDirs.forEach(p => {
            name = name.replace(p, '');
          });
        }
        return Boolean(name);
      })
      .join(PAGE_DEGREE_SPLIT_MARK);
  });

  if (!ROUTE_NAME_REG.test(routeName)) {
    routeName = INVALID_ROUTE_NAME;
    createInvalidNameError(filePath, routeName);
  }

  if (CAMEL_OR_PASCAL.test(routeName)) {
    createRecommendName(filePath);
  }

  return routeName;
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

function uniqueStrArray(...arr: string[][]) {
  const result: string[] = [];
  arr.forEach(item => {
    result.push(...item);
  });
  return [...new Set(result)];
}

export function getRouteNamesFromGlobs(globs: string[], options: ContextOption): RouteName {
  const lastDegree = globs.map(glob => getRouteNameFromGlob(glob, options));

  const all: string[] = [];

  lastDegree.forEach(routeName => {
    all.push(...getAllRouteNames(routeName));
  });

  return {
    all: uniqueStrArray(all),
    lastDegree
  };
}

function handleAddRouteName(glob: string, routeName: RouteName, options: ContextOption): RouteName {
  const name = getRouteNameFromGlob(glob, options);

  const parentNames = getAllRouteNames(name);

  return {
    all: uniqueStrArray(routeName.all, parentNames),
    lastDegree: uniqueStrArray(routeName.lastDegree, [name])
  };
}

function handleDeleteRouteName(glob: string, routeName: RouteName, options: ContextOption): RouteName {
  const name = getRouteNameFromGlob(glob, options);

  const parentNames = getAllRouteNames(name);

  const lastDegree = routeName.lastDegree.filter(item => item !== name);
  const all = routeName.all.filter(item => !parentNames.includes(item));

  return {
    all,
    lastDegree
  };
}

export function handleUpdateRouteName(params: {
  glob: string;
  routeName: RouteName;
  options: ContextOption;
  type: 'add' | 'unlink';
}): RouteName {
  const { glob, routeName, options, type } = params;
  if (type === 'add') {
    return handleAddRouteName(glob, routeName, options);
  }

  return handleDeleteRouteName(glob, routeName, options);
}

function getRouteViewImportFromGlob(glob: string, options: ContextOption) {
  const { rootDir } = options;

  const pageDir = getRelativePathFromRoot(options.pageDir);

  const prefix = `${rootDir}/${pageDir}/`;

  const path = `./${glob.replace(prefix, '')}`;

  return path;
}

export function getRouteViewImportsFromGlobs(globs: string[], options: ContextOption) {
  const imports: RouteImport[] = globs
    .map(glob => ({
      name: getRouteNameFromGlob(glob, options),
      path: getRouteViewImportFromGlob(glob, options)
    }))
    .filter(item => item.name !== INVALID_ROUTE_NAME);

  return imports;
}

function handleAddRouteViewImport(glob: string, routeImports: RouteImport[], options: ContextOption) {
  const name = getRouteNameFromGlob(glob, options);

  const path = getRouteViewImportFromGlob(glob, options);

  const result = [...routeImports];

  const findItem = routeImports.find(item => item.name === name);
  if (!findItem) {
    result.push({ name, path });
  }

  result.sort((pre, current) => (pre.name > current.name ? 1 : -1));

  return result;
}

function handleDeleteRouteViewImport(glob: string, routeImports: RouteImport[], options: ContextOption) {
  const name = getRouteNameFromGlob(glob, options);
  return routeImports.filter(item => item.name !== name);
}

export function handleUpdateRouteViewImport(params: {
  glob: string;
  routeImports: RouteImport[];
  options: ContextOption;
  type: 'add' | 'unlink';
}) {
  const { glob, routeImports, options, type } = params;

  if (type === 'add') {
    return handleAddRouteViewImport(glob, routeImports, options);
  }
  return handleDeleteRouteViewImport(glob, routeImports, options);
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

function getRoutePathFromName(routeName: string) {
  const PATH_SPLIT_MARK = '/';

  return PATH_SPLIT_MARK + routeName.replace(new RegExp(`${PAGE_DEGREE_SPLIT_MARK}`, 'g'), PATH_SPLIT_MARK);
}

export function getRouteModuleNameFromGlob(glob: string, options: ContextOption) {
  const routeName = getRouteNameFromGlob(glob, options);
  const routeNames = getAllRouteNames(routeName);

  if (!routeNames.length) {
    throw new Error(`文件路径解析名字失败: [path]:${glob} [name]:${routeName}`);
  }

  return routeNames[0];
}

export function getRouteModuleFromGlob(glob: string, options: ContextOption) {
  const routeName = getRouteNameFromGlob(glob, options);
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

export function getRouteModuleFilePath(moduleName: string, options: ContextOption, fileExtension = '.ts') {
  const { rootDir } = options;
  const routeModuleDir = getRelativePathFromRoot(options.routeModuleDir);

  const filePath = `${rootDir}/${routeModuleDir}/${moduleName}${fileExtension}`;

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
