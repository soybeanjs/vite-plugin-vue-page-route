import { access } from 'fs/promises';
import execa from 'execa';

export async function handleEslintFormat(filePath: string) {
  const eslintBinPath = `${process.cwd()}/node_modules/eslint/bin/eslint.js`;

  try {
    await access(eslintBinPath);
    await execa('node', [eslintBinPath, filePath, '--fix']);
  } catch {}
}
