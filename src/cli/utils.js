/**
 * aimin-skill CLI 通用工具
 * 负责文件系统读写、路径格式化与包信息读取
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 判断路径是否存在
 * @param {string} targetPath 目标路径
 * @returns {Promise<boolean>}
 */
export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 确保目录存在
 * @param {string} dirPath 目录路径
 * @returns {Promise<void>}
 */
export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * 读取文本文件
 * @param {string} filePath 文件路径
 * @returns {Promise<string | null>}
 */
export async function readTextIfExists(filePath) {
  if (!await pathExists(filePath)) return null;

  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
      return null;

    throw error;
  }
}

/**
 * 读取 JSON 文件
 * @param {string} filePath 文件路径
 * @returns {Promise<any | null>}
 */
export async function readJsonIfExists(filePath) {
  const text = await readTextIfExists(filePath);
  if (text === null) return null;
  return JSON.parse(text);
}

/**
 * 写入文本文件
 * @param {string} filePath 文件路径
 * @param {string} content 文件内容
 * @returns {Promise<void>}
 */
export async function writeText(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * 写入 JSON 文件
 * @param {string} filePath 文件路径
 * @param {unknown} data JSON 数据
 * @returns {Promise<void>}
 */
export async function writeJson(filePath, data) {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  await writeText(filePath, content);
}

/**
 * 将路径转为正斜杠格式
 * @param {string} filePath 文件路径
 * @returns {string}
 */
export function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

/**
 * 递归列出目录中的相对文件路径
 * @param {string} rootDir 根目录
 * @returns {Promise<string[]>}
 */
export async function listRelativeFiles(rootDir) {
  const relativeFiles = [];
  await collectRelativeFiles(rootDir, rootDir, relativeFiles);
  return relativeFiles.sort();
}

/**
 * 递归收集相对文件路径
 * @param {string} rootDir 根目录
 * @param {string} currentDir 当前目录
 * @param {string[]} relativeFiles 文件集合
 * @returns {Promise<void>}
 */
async function collectRelativeFiles(rootDir, currentDir, relativeFiles) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      await collectRelativeFiles(rootDir, fullPath, relativeFiles);
      continue;
    }

    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    relativeFiles.push(path.relative(rootDir, fullPath));
  }
}

/**
 * 删除空父目录直到指定根目录
 * @param {string} startDir 起始目录
 * @param {string} stopDir 停止目录
 * @returns {Promise<void>}
 */
export async function removeEmptyParentDirs(startDir, stopDir) {
  let currentDir = startDir;
  const normalizedStopDir = path.resolve(stopDir);

  while (path.resolve(currentDir).startsWith(normalizedStopDir)) {
    if (path.resolve(currentDir) === normalizedStopDir) return;

    try {
      const children = await fs.readdir(currentDir);
      if (children.length > 0) return;
      await fs.rmdir(currentDir);
      currentDir = path.dirname(currentDir);
    } catch {
      return;
    }
  }
}

/**
 * 读取包元信息
 * @param {string} repoRoot 仓库根目录
 * @returns {Promise<{ name: string; version: string }>}
 */
export async function readPackageMeta(repoRoot) {
  const packagePath = path.join(repoRoot, 'package.json');
  const packageJson = await readJsonIfExists(packagePath);

  if (!packageJson?.name || !packageJson?.version)
    throw new Error(`缺少有效的 package.json: ${packagePath}`);

  return {
    name: packageJson.name,
    version: packageJson.version
  };
}
