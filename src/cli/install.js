/**
 * aimin-skill 安装逻辑
 * 负责将 skill 与命令同步到 Claude Code 和 Codex 用户目录
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  COMMAND_DEFINITIONS,
  MANIFEST_FILE_NAME,
  MANIFEST_VERSION,
  PACKAGE_NAME,
  SKILL_NAME,
  TOOL_DEFINITIONS
} from './constants.js';
import { buildCommandContent, isManagedContent } from './templates.js';
import {
  ensureDir,
  listRelativeFiles,
  pathExists,
  readJsonIfExists,
  readPackageMeta,
  readTextIfExists,
  removeEmptyParentDirs,
  toPosixPath,
  writeJson,
  writeText
} from './utils.js';

/**
 * 构建安装上下文
 * @param {object} options 构建参数
 * @param {string} options.homeDir 用户目录
 * @param {string} options.repoRoot 仓库根目录
 * @returns {Promise<object>}
 */
export async function buildInstallContext(options) {
  const { homeDir, repoRoot } = options;
  const packageMeta = await readPackageMeta(repoRoot);
  const sourceSkillDir = path.join(repoRoot, 'skills');
  const sourceSkillEntryPath = path.join(sourceSkillDir, 'SKILL.md');

  if (!await pathExists(sourceSkillEntryPath))
    throw new Error(`缺少 skill 入口文件: ${sourceSkillEntryPath}`);

  const sourceSkillFiles = await listRelativeFiles(sourceSkillDir);
  const toolPlans = TOOL_DEFINITIONS.map(tool => createToolPlan({ homeDir, tool }));

  return {
    packageMeta,
    sourceSkillDir,
    sourceSkillFiles,
    toolPlans
  };
}

/**
 * 执行用户级安装
 * @param {object} options 安装参数
 * @param {string} options.homeDir 用户目录
 * @param {string} options.repoRoot 仓库根目录
 * @param {boolean} [options.force] 是否清理旧的受管文件
 * @returns {Promise<object>}
 */
export async function initUserInstall(options) {
  const { force = false } = options;
  const context = await buildInstallContext(options);
  const results = [];

  for (const toolPlan of context.toolPlans) {
    const manifest = await assertManagedTargets(toolPlan);
    const cleanupResult = await cleanupManagedTargets({
      force,
      manifest,
      sourceSkillFiles: context.sourceSkillFiles,
      toolPlan
    });

    await writeManagedTargets({
      packageMeta: context.packageMeta,
      sourceSkillDir: context.sourceSkillDir,
      sourceSkillFiles: context.sourceSkillFiles,
      toolPlan
    });

    results.push({
      tool: toolPlan.tool,
      skillDir: toolPlan.skillDir,
      commandPlans: toolPlan.commandPlans,
      cleanupResult
    });
  }

  return {
    packageMeta: context.packageMeta,
    results
  };
}

/**
 * 创建单个工具的安装计划
 * @param {object} options 创建参数
 * @param {string} options.homeDir 用户目录
 * @param {object} options.tool 工具定义
 * @returns {object}
 */
function createToolPlan(options) {
  const { homeDir, tool } = options;
  const toolRoot = path.join(homeDir, tool.rootDirName);
  const commandsDir = path.join(toolRoot, 'commands');
  const skillsDir = path.join(toolRoot, 'skills');
  const skillDir = path.join(skillsDir, SKILL_NAME);
  const manifestPath = path.join(skillDir, MANIFEST_FILE_NAME);
  const commandPlans = COMMAND_DEFINITIONS.map(command => ({
    ...command,
    filePath: path.join(commandsDir, command.fileName)
  }));

  return {
    tool,
    toolRoot,
    commandsDir,
    skillsDir,
    skillDir,
    manifestPath,
    commandPlans
  };
}

/**
 * 校验目标路径是否可安全写入
 * @param {object} toolPlan 工具安装计划
 * @returns {Promise<any | null>}
 */
async function assertManagedTargets(toolPlan) {
  const manifest = await assertManagedSkillDir(toolPlan);
  await assertManagedCommandFiles(toolPlan);
  return manifest;
}

/**
 * 校验 skill 目录是否由当前工具管理
 * @param {object} toolPlan 工具安装计划
 * @returns {Promise<any | null>}
 */
async function assertManagedSkillDir(toolPlan) {
  if (!await pathExists(toolPlan.skillDir)) return null;

  const manifest = await readJsonIfExists(toolPlan.manifestPath);
  if (!manifest || manifest.managedBy !== PACKAGE_NAME)
    throw new Error(`[${toolPlan.tool.label}] 发现未受管的 skill 目录: ${toolPlan.skillDir}`);

  return manifest;
}

/**
 * 校验命令文件是否由当前工具管理
 * @param {object} toolPlan 工具安装计划
 * @returns {Promise<void>}
 */
async function assertManagedCommandFiles(toolPlan) {
  for (const commandPlan of toolPlan.commandPlans) {
    const content = await readTextIfExists(commandPlan.filePath);
    if (content === null) continue;
    if (isManagedContent(content)) continue;

    throw new Error(`[${toolPlan.tool.label}] 发现同名未受管命令文件: ${commandPlan.filePath}`);
  }
}

/**
 * 清理旧的受管文件
 * @param {object} options 清理参数
 * @param {boolean} options.force 是否启用强制清理
 * @param {any | null} options.manifest 已有 manifest
 * @param {string[]} options.sourceSkillFiles 当前 skill 文件列表
 * @param {object} options.toolPlan 工具安装计划
 * @returns {Promise<{ removedSkillFiles: string[]; removedCommandFiles: string[] }>}
 */
async function cleanupManagedTargets(options) {
  const { force, manifest, sourceSkillFiles, toolPlan } = options;
  const removedSkillFiles = [];
  const removedCommandFiles = [];

  if (!force || !manifest) {
    return {
      removedSkillFiles,
      removedCommandFiles
    };
  }

  const sourceSkillFileSet = new Set(sourceSkillFiles);
  for (const relativePath of manifest.skillFiles || []) {
    if (sourceSkillFileSet.has(relativePath)) continue;

    const targetPath = path.join(toolPlan.skillDir, relativePath);
    if (!await pathExists(targetPath)) continue;

    await fs.rm(targetPath, { force: true });
    await removeEmptyParentDirs(path.dirname(targetPath), toolPlan.skillDir);
    removedSkillFiles.push(relativePath);
  }

  const commandFileSet = new Set(toolPlan.commandPlans.map(commandPlan => commandPlan.fileName));
  for (const fileName of manifest.commandFiles || []) {
    if (commandFileSet.has(fileName)) continue;

    const targetPath = path.join(toolPlan.commandsDir, fileName);
    const content = await readTextIfExists(targetPath);
    if (!isManagedContent(content)) continue;

    await fs.rm(targetPath, { force: true });
    await removeEmptyParentDirs(path.dirname(targetPath), toolPlan.commandsDir);
    removedCommandFiles.push(fileName);
  }

  return {
    removedSkillFiles,
    removedCommandFiles
  };
}

/**
 * 写入受管的 skill 与命令文件
 * @param {object} options 写入参数
 * @param {object} options.packageMeta 包信息
 * @param {string} options.sourceSkillDir 源 skill 目录
 * @param {string[]} options.sourceSkillFiles 源 skill 文件列表
 * @param {object} options.toolPlan 工具安装计划
 * @returns {Promise<void>}
 */
async function writeManagedTargets(options) {
  const { packageMeta, sourceSkillDir, sourceSkillFiles, toolPlan } = options;
  await ensureDir(toolPlan.commandsDir);
  await ensureDir(toolPlan.skillsDir);

  for (const relativePath of sourceSkillFiles) {
    const sourcePath = path.join(sourceSkillDir, relativePath);
    const targetPath = path.join(toolPlan.skillDir, relativePath);

    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
  }

  for (const commandPlan of toolPlan.commandPlans) {
    const content = buildCommandContent({
      packageVersion: packageMeta.version,
      skillDir: toolPlan.skillDir,
      tool: toolPlan.tool,
      command: commandPlan
    });

    await writeText(commandPlan.filePath, content);
  }

  await writeManifest({
    packageMeta,
    sourceSkillDir,
    sourceSkillFiles,
    toolPlan
  });
}

/**
 * 写入受管 manifest
 * @param {object} options 写入参数
 * @param {object} options.packageMeta 包信息
 * @param {string} options.sourceSkillDir 源 skill 目录
 * @param {string[]} options.sourceSkillFiles 源 skill 文件列表
 * @param {object} options.toolPlan 工具安装计划
 * @returns {Promise<void>}
 */
async function writeManifest(options) {
  const { packageMeta, sourceSkillDir, sourceSkillFiles, toolPlan } = options;
  const manifest = {
    manifestVersion: MANIFEST_VERSION,
    managedBy: PACKAGE_NAME,
    packageName: packageMeta.name,
    packageVersion: packageMeta.version,
    skillName: SKILL_NAME,
    tool: toolPlan.tool.key,
    installedAt: new Date().toISOString(),
    sourceSkillDir: toPosixPath(sourceSkillDir),
    skillFiles: sourceSkillFiles,
    commandFiles: toolPlan.commandPlans.map(commandPlan => commandPlan.fileName)
  };

  await writeJson(toolPlan.manifestPath, manifest);
}
