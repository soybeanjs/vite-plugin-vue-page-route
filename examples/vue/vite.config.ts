import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Components from 'unplugin-vue-components/vite';
import unocss from 'unocss/vite';
import pageRoute from '@soybeanjs/vite-plugin-vue-page-route';
import Inspect from 'vite-plugin-inspect';

export default defineConfig(() => {
  const rootPath = path.resolve(process.cwd());
  const srcPath = `${rootPath}/src`;

  return {
    resolve: {
      alias: {
        '~': rootPath,
        '@': srcPath
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "./src/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      Components({
        dts: 'src/typings/components.d.ts',
        types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }]
      }),
      unocss(),
      pageRoute(),
      Inspect()
    ],
    server: {
      host: '0.0.0.0'
    },
    build: {
      brotliSize: false,
      sourcemap: false,
      commonjsOptions: {
        ignoreTryCatch: false
      }
    }
  };
});
