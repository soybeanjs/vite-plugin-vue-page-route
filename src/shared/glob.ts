import fastGlob from 'fast-glob';

/**
 * get the glob of page file
 * @param pageGlob glob to match page files, based on the pageDir
 */
export function getGlobsOfPage(pageGlob: string[], pageDir: string) {
  const globs = fastGlob.sync(pageGlob, {
    onlyFiles: true,
    cwd: pageDir
  });

  return globs.sort();
}
