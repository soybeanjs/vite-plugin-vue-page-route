import type { Plugin } from 'vite';
import { Context } from './context';
import type { Options } from './types';

/**
 * plugin
 * @description generate router page declaration
 */
function routerPagePlugin(options?: Partial<Options>) {
  const context = new Context(options);

  const plugin: Plugin = {
    name: 'router-page',
    enforce: 'post',
    configResolved(config) {
      context.init(config.root);
    },
    configureServer(server) {
      context.setupFileWatcher(server.watcher);
    }
  };

  return plugin;
}

export default routerPagePlugin;

export type { Options };
