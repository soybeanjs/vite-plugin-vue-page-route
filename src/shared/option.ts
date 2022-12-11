import {
  PAGE_DIR,
  PAGE_FILE_PATTERN,
  GLOB_FILE_PATTERN,
  EXCLUDE_DIRS,
  IGNORE_ROUTE_DIRS,
  ROUTE_DTS,
  ROUTE_MODULE_DIR,
  ROUTE_MODULE_DECLARATION
} from './constant';
import type { PluginOption, ContextOption, FilterPattern } from '../types';

function getPatterns(pattern?: FilterPattern) {
  if (!pattern) return null;

  const patterns: (RegExp | string)[] = Array.isArray(pattern) ? pattern : [pattern];

  return patterns.map(item => {
    if (typeof item === 'string') {
      return new RegExp(item);
    }
    return item;
  });
}

/**
 * create plugin options
 * @param options user custom options for plugin
 */
export function createPluginOptions(userOptions: Partial<PluginOption>, rootDir: string) {
  const options: ContextOption = {
    pageDir: PAGE_DIR,
    pageFilePattern: getPatterns(userOptions.pageFilePattern) || [PAGE_FILE_PATTERN],
    globFilePattern: GLOB_FILE_PATTERN,
    excludeDirs: EXCLUDE_DIRS,
    ignoreRouteDirs: getPatterns(userOptions.ignoreRouteDirs) || [IGNORE_ROUTE_DIRS],
    routeDts: ROUTE_DTS,
    routeModuleDir: ROUTE_MODULE_DIR,
    routeModuleDeclaration: ROUTE_MODULE_DECLARATION,
    importHandler: names => names.map(name => ({ name, lazy: true })),
    rootDir
  };

  Object.assign<ContextOption, Partial<PluginOption>>(options, userOptions);

  return options;
}
