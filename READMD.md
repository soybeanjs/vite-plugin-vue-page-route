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
    builtinRoute: { // 默认值
      root: 'root',
      notFound: 'not-found'
    },
    pagesFormatter: names =>
      names.map(name => {
        /** 系统的内置路由，该文件夹名称不作为RouteKey */
        const SYSTEM_VIEW = 'system-view_';
        return name.replace(SYSTEM_VIEW, '');
      })
  })]
});
```
