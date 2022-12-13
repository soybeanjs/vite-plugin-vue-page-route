export function getBlobRelativePathFromRoot(glob: string, pageDir: string) {
  return `${pageDir}/${glob}`;
}
