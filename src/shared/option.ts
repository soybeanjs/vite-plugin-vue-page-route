import { makeRe } from 'micromatch';
import { PAGE_DIR, PAGE_GLOB, ROUTE_DTS, ROUTE_MODULE_DIR, ROUTE_MODULE_TYPE } from './constant';
import type { PluginOption, ContextOption } from '../types';

/**
 * create plugin options
 * @param options user custom options for plugin
 */
export function createPluginOptions(userOptions: Partial<PluginOption>, rootDir: string) {
  const IGNORE_UNDERLINE_REG = /^_([a-zA-Z]|$)+_*/;

  const options: ContextOption = {
    pageDir: PAGE_DIR,
    pageGlob: PAGE_GLOB,
    routeDts: ROUTE_DTS,
    routeModuleDir: ROUTE_MODULE_DIR,
    routeModuleType: ROUTE_MODULE_TYPE,
    importHandler: names => names.map(name => ({ name, lazy: true })),
    routeNameTansformer: name => name.replace(IGNORE_UNDERLINE_REG, ''),
    rootDir,
    pagePattern: PAGE_GLOB.map(glob => makeRe(glob))
  };

  Object.assign<ContextOption, Partial<PluginOption>>(options, userOptions);

  return options;
}
