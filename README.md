# @soybeanjs/vite-plugin-vue-page-route

A vite plugin for vue, auto generate route info by page

Vite 插件，自动根据页面文件生成页面的路由声明、生成页面组件导入、生成路由模块声明

## 用法

```ts
import { defineConfig } from 'vite';
import pageRoute from '@soybeanjs/vite-plugin-vue-page-route';

export default defineConfig({
  plugins: [pageRoute({
    pageDir: 'src/views', // default
    pageFilePattern: /index\.(vue|tsx|jsx)/, // default
    globFilePattern: ['index.{vue,tsx,jsx}'], // default
    excludeDirs: ['components'], // default
    ignoreRouteDirs: /^_.*/, // default
    routeModuleDir: 'src/typings/page-route.d.ts', // default
    routeModuleDeclaration: 'AuthRoute.Route', // default
    importHandler: names => names.map(name => ({ name, lazy: true })) // default
  })]
});
```
