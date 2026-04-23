import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliEntryPath = path.join(repoRoot, 'bin', 'aimin-skill.js');
const commandArgs = process.argv.slice(2);

if (commandArgs.length === 0) {
  console.error('缺少子命令，例如: pnpm run local:init 或 pnpm run local:doctor');
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [cliEntryPath, ...commandArgs],
  {
    cwd: repoRoot,
    stdio: 'inherit'
  }
);

child.on('exit', code => {
  process.exitCode = code ?? 1;
});

child.on('error', error => {
  console.error(`执行本地 CLI 失败: ${error.message}`);
  process.exitCode = 1;
});
