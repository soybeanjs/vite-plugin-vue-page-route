# @soybeanjs/vite-plugin-vue-page-route

A Vite plugin for vue, auto generate route info by page, include route declaration, route file import, route module const.

## Usage

```ts
import { defineConfig } from 'vite';
import pageRoute from '@soybeanjs/vite-plugin-vue-page-route';

export default defineConfig({
  plugins: [pageRoute({
    pageDir: 'src/views', // default
    pageGlobs: ['**/index.{vue,tsx,jsx}', '!**/components*'], // default
    routeDts: 'src/typings/page-route.d.ts', // default
    routeModuleDir: 'src/router/modules', // default
    routeModuleExt: 'ts', // default
    routeModuleType: 'AuthRoute.Route', // default
    /**
     * @example _builtin_login => login
     */
    routeNameTansformer: name => name.replace(/^_([a-zA-Z]|[0-9]|$)+_*/, ''), // default
    /**
     * whether the route is lazy import
     * @param name route name
     * @example
     * - the direct import
     * ```ts
     * import Home from './views/home/index.vue';
     * ```
     * - the lazy import
     * ```ts
     * const Home = import('./views/home/index.vue');
     * ```
     */
    lazyImport: _name => true // default
  })]
});
```
