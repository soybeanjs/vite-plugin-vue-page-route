import type { FileWatcherDispatch, FileWatcherEvent } from '../types';

interface Hooks {
  /**
   * rename the directory, which includes page files
   * @example
   * ```
   * example1:
   * home                    home-new
   * ├── first               ├── first
   * │   └── index.vue  ==>  │   └── index.vue
   * └── second              └── second
   *     └── index.vue           └── index.vue
   * example2:
   * home                    home
   * └── first          ==>  └── first-new
   *     └── index.vue           └── index.vue
   * ```
   */
  onRenameDirectoryWithFile(): Promise<void>;
  /**
   * delete the directory, which includes page files
   * * @example
   * ```
   * example1:
   * home
   * ├── first
   * │   └── index.vue  ==> (delete directory home)
   * └── second
   *     └── index.vue
   * example2:
   * home                      home
   * ├── first           ==>   └── first
   * │   └── index.vue             └── index.vue
   * └── second
   *     └── index.vue
   * ```
   */
  onDeleteDirectoryWithFile(): Promise<void>;
  /**
   * add a directory, which includes page files, it may be a copy action
   * * @example
   * ```
   * example1:
   *                               home
   *                               ├── first
   * (add directory home)   ==>    │   └── index.vue
   *                               └── second
   *                                   └── index.vue
   * example2:
   * home                      home
   * └── second                ├── first
   *     └── index.vue  ==>    │   └── index.vue
   *                           └── second
   *                               └── index.vue
   * ```
   */
  onAddDirectoryWithFile(): Promise<void>;
  /**
   * delete a page file
   * @example
   * ```
   * example1:
   * home           ==>      home
   * └── index.vue
   * example2:
   * home           ==>      home
   * └── first               └── first
   *     └── index.vue
   * ```
   */
  onDeleteFile(): Promise<void>;
  /**
   * add a page file
   * @example
   * ```
   * example1:
   * home        ==>       home
   *                       └── index.vue
   * example2:
   * home        ==>       home
   * └── first             └── first
   *                           └── index.vue
   * ```
   */
  onAddFile(): Promise<void>;
}

export async function fileWatcherHandler(dispatchs: FileWatcherDispatch[], hooks: Hooks) {
  const dispatchWithCategory: Record<FileWatcherEvent, string[]> = {
    addDir: [],
    unlinkDir: [],
    add: [],
    unlink: []
  };

  dispatchs.forEach(item => {
    dispatchWithCategory[item.event].push(item.path);
  });

  const hasAddDir = dispatchWithCategory.addDir.length > 0;
  const hasUnlinkDir = dispatchWithCategory.unlinkDir.length > 0;
  const hasAdd = dispatchWithCategory.add.length > 0;
  const hasUnlink = dispatchWithCategory.unlink.length > 0;

  const { onRenameDirectoryWithFile, onDeleteDirectoryWithFile, onAddDirectoryWithFile, onDeleteFile, onAddFile } =
    hooks;

  const conditions: [boolean, () => Promise<void>][] = [
    [hasAddDir && hasUnlinkDir && hasAdd && hasUnlink, onRenameDirectoryWithFile],
    [hasUnlinkDir && hasUnlink, onDeleteDirectoryWithFile],
    [hasAddDir && hasAdd, onAddDirectoryWithFile],
    [hasUnlink, onDeleteFile],
    [hasAdd, onAddFile]
  ];

  let callback: () => Promise<void> = () => Promise.resolve();

  conditions.some(([condition, handler]) => {
    if (condition) {
      callback = handler;
    }
    return condition;
  });

  if (callback) {
    await callback();
  }
}
