import type { Plugin } from 'vite';
import { createPluginOptions } from './utils';
import { generateDeclaration } from './declaration';
import type { Options } from './types';

/**
 * plugin
 * @description generate router page declaration
 */
function routerPagePlugin(options?: Partial<Options>) {
  const pluginOptions = createPluginOptions(options);

  const plugin: Plugin = {
    name: 'router-page',
    enforce: 'post',
    configResolved(config) {
      generateDeclaration(config.root, pluginOptions);
    }
  };

  return plugin;
}

export default routerPagePlugin;

export type { Options };
