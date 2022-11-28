# @soybeanjs/router-page

Vite 插件，自动根据页面文件生成页面的路由声明文件

## 用法

```ts
import { defineConfig } from 'vite';
import routerPage from '@soybeanjs/router-page';

export default defineConfig({
  plugins: [routerPage({
    dir: 'src/views', // 默认值
    excludes: ['components'], // 默认值
    dts: 'src/typings/router-page.d.ts', // 默认值
    patterns: ['index.vue'], // 默认值
    ignoreDirPrefix: '_',
    builtinRoute: { // 默认值
      root: 'root',
      notFound: 'not-found'
    },
    notLazyRoutes: [], // 默认值
    pagesFormatter: names => names // 默认
  })]
});
```
