import path from 'path';

export function getRelativePathFromRoot(pathName: string) {
  const rootPath = process.cwd();

  const normalizePath = path.normalize(pathName);

  const includeRootPath = normalizePath.includes(rootPath);

  const isAbsolutePath = path.isAbsolute(pathName);

  if (includeRootPath) {
    return normalizePath.replace(`${rootPath}/`, '');
  }

  if (isAbsolutePath) {
    return normalizePath.slice(1);
  }

  return normalizePath;
}
