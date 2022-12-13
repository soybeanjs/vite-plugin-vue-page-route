# @soybeanjs/vite-plugin-vue-page-route

A Vite plugin for vue, auto generate route info by page, include route declaration, route file import, route module const.

## Usage

```ts
import { defineConfig } from 'vite';
import pageRoute from '@soybeanjs/vite-plugin-vue-page-route';

export default defineConfig({
  plugins: [pageRoute({
    pageDir: 'src/views', // default
    pageGlob: ['**/index.{vue,tsx,jsx}', '!**/components*'], // default
    routeDts: 'src/typings/page-route.d.ts', // default
    routeModuleDir: 'src/router/modules', // default
    routeModuleType: 'AuthRoute.Route', // default
    /**
     * @example _builtin_login => login
     */
    routeNameTansformer: name => name.replace(/^_([a-zA-Z]|$)+_*/, ''), // default
    importHandler: names => names.map(name => ({ name, lazy: true })) // default
  })]
});
```
