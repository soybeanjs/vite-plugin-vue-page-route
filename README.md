# @soybeanjs/vite-plugin-vue-page-route

中文 | [English](./README.en_US.md)

Vite 插件，根据页面文件自动生成路由声明、路由组件的导入、路由模块的定义。

## 用法

```ts
import { defineConfig } from 'vite';
import pageRoute from '@soybeanjs/vite-plugin-vue-page-route';

export default defineConfig({
  plugins: [pageRoute({
    pageDir: 'src/views', // 默认
    pageGlobs: ['**/index.{vue,tsx,jsx}', '!**/components*'], // 默认
    routeDts: 'src/typings/page-route.d.ts', // 默认
    routeModuleDir: 'src/router/modules', // 默认
    routeModuleType: 'AuthRoute.Route', // 默认
    /**
     * @example _builtin_login => login
     */
    routeNameTansformer: name => name.replace(/^_([a-zA-Z]|[0-9]|$)+_*/, ''), // 默认
    lazyImport: _name => true // 默认
  })]
});
```
