import type { FileWatcherDispatch, FileWatcherHooks, FileWatcherEvent } from '../types';

export async function fileWatcherHandler(dispatchs: FileWatcherDispatch[], hooks: FileWatcherHooks) {
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

  const { onRenameDirWithFile, onDelDirWithFile, onAddDirWithFile, onDelFile, onAddFile } = hooks;

  const conditions: [boolean, () => Promise<void>][] = [
    [hasAddDir && hasUnlinkDir && hasAdd && hasUnlink, onRenameDirWithFile],
    [hasUnlinkDir && hasUnlink, onDelDirWithFile],
    [hasAddDir && hasAdd, onAddDirWithFile],
    [hasUnlink, onDelFile],
    [hasAdd, onAddFile]
  ];

  const [, callback] = conditions.find(([condition]) => condition) || [true, async () => {}];

  await callback();
}

function getTheSmallLengthOfStrArr(arr: string[]) {
  let name: string | null = null;
  arr.forEach(item => {
    if (name === null) {
      name = item;
    } else {
      name = item.length < name.length ? item : name;
    }
  });

  return name;
}

export function getRenameConfig(dispatchs: FileWatcherDispatch[]) {
  const unlinkDirs: string[] = [];
  const addDirs: string[] = [];

  dispatchs.forEach(dispatch => {
    if (dispatch.event === 'unlinkDir') {
      unlinkDirs.push(dispatch.path);
    }
    if (dispatch.event === 'addDir') {
      addDirs.push(dispatch.path);
    }
  });

  const delName = getTheSmallLengthOfStrArr(unlinkDirs);
  const addName = getTheSmallLengthOfStrArr(addDirs);

  return {
    delName,
    addName
  };
}
