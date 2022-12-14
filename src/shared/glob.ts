import fastGlob from 'fast-glob';
import { isMatch } from 'micromatch';
import type { ContextOption } from '../types';

/**
 * get the glob of page file
 * @param pageGlobs glob to match page files, based on the pageDir
 */
export function getGlobsOfPage(pageGlobs: string[], pageDir: string) {
  const globs = fastGlob.sync(pageGlobs, {
    onlyFiles: true,
    cwd: pageDir
  });

  return globs.sort();
}

export function getRelativePathOfGlob(glob: string, pageDir: string) {
  return `${pageDir}/${glob}`;
}

export function matchGlob(glob: string, options: ContextOption) {
  const isFile = isMatch(glob, '**/*.*');
  const { pageGlobs } = options;

  const patterns = isFile ? pageGlobs : pageGlobs.filter(pattern => !pattern.includes('.'));

  return patterns.every(pattern => isMatch(glob, pattern));
}
