import type { Plugin } from 'vite';
import Context from './context';
import type { PluginOption } from './types';

/**
 * A vite plugin for vue, auto generate route info by page
 * @param options plugin options
 */
function pageRoute(options?: Partial<PluginOption>) {
  const context = new Context(options);

  const plugin: Plugin = {
    name: 'vite-plugin-vue-page-route',
    enforce: 'post',
    configureServer() {
      context.setupFileWatcher();
    }
  };

  return plugin;
}

export default pageRoute;

export type { PluginOption };
