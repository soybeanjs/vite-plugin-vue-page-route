import path from 'path';
import { red, bgRed, green, bgYellow, yellow } from 'kolorist';

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

export function createInvalidNameError(filePath: string, routeName: string) {
  let error = `${bgRed('ERROR')} `;
  error += red(`the path is invalid: ${filePath} !\n`);
  error += red(`routeName: ${routeName} !`);
  error += green(
    `\n the directory name and file name can only include letter[a-zA-Z], number[0-9], underline[_] and dollar[$]`
  );
  throw Error(error);
}

export function createRecommendName(filePath: string) {
  let warning = `${bgYellow('RECOMMEND')} `;
  warning += yellow(`the filePath: ${filePath}`);
  warning += green(`\n it's recommended to use kebab-case name style`);
  warning += green(`\n example: good: user-info bad: userInfo, UserInfo`);

  // eslint-disable-next-line no-console
  console.warn(warning);
}
