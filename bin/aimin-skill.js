#!/usr/bin/env node
/**
 * aimin-skill CLI 入口
 * 负责定位包根目录并转发命令参数
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCli } from '../src/cli/index.js';

const filePath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(filePath), '..');
const exitCode = await runCli({
  argv: process.argv.slice(2),
  cwd: process.cwd(),
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
  repoRoot
});

process.exitCode = exitCode;
