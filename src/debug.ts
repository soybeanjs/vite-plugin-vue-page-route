import { createFWHooksOfGenModule } from './context/fs';
import { createPluginOptions } from './shared';
import type { FileWatcherDispatch } from './types';

const dispatchs: FileWatcherDispatch[] = [
  // { event: 'unlinkDir', path: 'home/fifth' },
  // { event: 'unlinkDir', path: 'home/first-page' },
  // { event: 'unlinkDir', path: 'home/four' },
  // { event: 'unlinkDir', path: 'home/second-page' },
  // { event: 'unlinkDir', path: 'home/third' },
  { event: 'unlinkDir', path: 'home/multi1/first' },
  { event: 'unlinkDir', path: 'home/multi1/second' },
  { event: 'unlinkDir', path: 'home/multi1/third/third-child1' },
  { event: 'unlinkDir', path: 'home/multi1/third/third-child2' },
  { event: 'unlinkDir', path: 'home/multi1/third/third-child3' },
  { event: 'unlinkDir', path: 'home/multi1/third' },
  { event: 'unlinkDir', path: 'home/multi1' },
  // { event: 'unlinkDir', path: 'home' },
  // { event: 'unlink', path: 'home/fifth/index.vue' },
  // { event: 'unlink', path: 'home/first-page/index.vue' },
  // { event: 'unlink', path: 'home/four/index.vue' },
  // { event: 'unlink', path: 'home/second-page/index.vue' },
  // { event: 'unlink', path: 'home/third/index.vue' },
  { event: 'unlink', path: 'home/multi1/first/index.vue' },
  { event: 'unlink', path: 'home/multi1/second/index.vue' },
  { event: 'unlink', path: 'home/multi1/third/third-child1/index.vue' },
  { event: 'unlink', path: 'home/multi1/third/third-child2/index.vue' },
  // { event: 'addDir', path: 'home1' },
  // { event: 'addDir', path: 'home1/fifth' },
  // { event: 'addDir', path: 'home1/first-page' },
  // { event: 'addDir', path: 'home1/four' },
  // { event: 'addDir', path: 'home1/multi' },
  // { event: 'addDir', path: 'home1/second-page' },
  // { event: 'addDir', path: 'home1/third' },
  // { event: 'add', path: 'home1/third/index.vue' },
  // { event: 'add', path: 'home1/second-page/index.vue' },
  { event: 'addDir', path: 'home1/multi/first' },
  { event: 'addDir', path: 'home1/multi/second' },
  { event: 'addDir', path: 'home1/multi/third' },
  { event: 'addDir', path: 'home1/multi/third/third-child1' },
  { event: 'addDir', path: 'home1/multi/third/third-child2' },
  { event: 'addDir', path: 'home1/multi/third/third-child3' },
  { event: 'add', path: 'home1/multi/third/third-child2/index.vue' },
  { event: 'add', path: 'home1/multi/third/third-child1/index.vue' },
  { event: 'add', path: 'home1/multi/second/index.vue' },
  { event: 'add', path: 'home1/multi/first/index.vue' }
  // { event: 'add', path: 'home1/four/index.vue' },
  // { event: 'add', path: 'home1/first-page/index.vue' },
  // { event: 'add', path: 'home1/fifth/index.vue' }
];

const options = createPluginOptions({}, process.cwd());

const hooks = createFWHooksOfGenModule(dispatchs, options);

async function debug() {
  await hooks.onRenameDirWithFile();
}

debug();
