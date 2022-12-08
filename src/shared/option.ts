import {
  PAGE_DIR,
  PAGE_FILE_PATTERN,
  EXCLUDE_DIRS,
  IGNORE_ROUTE_DIRS,
  ROUTE_DTS,
  ROUTE_MODULE_DIR,
  ROUTE_MODULE_DECLARATION
} from './constant';
import type { PluginOption } from '../types';

/**
 * create plugin options
 * @param options user custom options for plugin
 */
export function createPluginOptions(userOptions: Partial<PluginOption> = {}) {
  const options: PluginOption = {
    pageDir: PAGE_DIR,
    pageFilePattern: PAGE_FILE_PATTERN,
    excludeDirs: EXCLUDE_DIRS,
    ignoreRouteDirs: IGNORE_ROUTE_DIRS,
    routeDts: ROUTE_DTS,
    routeModuleDir: ROUTE_MODULE_DIR,
    routeModuleDeclaration: ROUTE_MODULE_DECLARATION,
    importHandler: names => names.map(name => ({ name, lazy: true }))
  };

  Object.assign<PluginOption, Partial<PluginOption>>(options, userOptions);

  return options;
}
