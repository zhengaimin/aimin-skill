/**
 * aimin-skill 安装逻辑
 * 负责生成本地 marketplace/plugin，并注册到 Claude Code 与 Codex
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  COMMAND_DEFINITIONS,
  MANIFEST_FILE_NAME,
  MANIFEST_VERSION,
  MARKETPLACE_NAME,
  PACKAGE_NAME,
  PLUGIN_NAME,
  TOOL_DEFINITIONS
} from './constants.js';
import { buildPluginCommandContent, buildPluginSkillContent } from './templates.js';
import {
  ensureDir,
  listRelativeFiles,
  pathExists,
  readJsonIfExists,
  readPackageMeta,
  readTextIfExists,
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
  const sourceCommandDir = path.join(repoRoot, 'commands');
  const sourceSkillDir = path.join(repoRoot, 'skills');
  const sourceSkillEntryPath = path.join(sourceSkillDir, 'SKILL.md');

  if (!await pathExists(sourceSkillEntryPath))
    throw new Error(`缺少 skill 入口文件: ${sourceSkillEntryPath}`);

  const sourceSkillFiles = await listRelativeFiles(sourceSkillDir);
  const commandGuideMap = await readCommandGuideMap(sourceCommandDir);
  const marketplaceRoot = path.join(homeDir, `.${PACKAGE_NAME}-marketplace`);
  const pluginRoot = path.join(marketplaceRoot, 'plugins', PLUGIN_NAME);
  const referenceDir = path.join(pluginRoot, 'references');
  const manifestPath = path.join(marketplaceRoot, MANIFEST_FILE_NAME);
  const toolPlans = TOOL_DEFINITIONS.map(tool => createToolPlan({
    homeDir,
    marketplaceRoot,
    tool
  }));

  return {
    commandGuideMap,
    manifestPath,
    marketplaceRoot,
    packageMeta,
    pluginRoot,
    referenceDir,
    sourceSkillDir,
    sourceSkillFiles,
    toolPlans
  };
}

/**
 * 执行用户级安装
 * @param {object} options 安装参数
 * @param {NodeJS.ProcessEnv} [options.env] 进程环境变量
 * @param {boolean} [options.force] 是否强制重建 marketplace
 * @param {string} options.homeDir 用户目录
 * @param {string} options.repoRoot 仓库根目录
 * @returns {Promise<object>}
 */
export async function initUserInstall(options) {
  const { env = process.env, force = false } = options;
  const context = await buildInstallContext(options);

  if (force && await pathExists(context.marketplaceRoot))
    await fs.rm(context.marketplaceRoot, { recursive: true, force: true });

  await writeManagedMarketplace(context);

  const results = [];
  for (const toolPlan of context.toolPlans)
    results.push(await registerTool({
      env,
      homeDir: options.homeDir,
      marketplaceRoot: context.marketplaceRoot,
      toolPlan
    }));

  await writeManagedManifest({
    context,
    results
  });

  return {
    packageMeta: context.packageMeta,
    marketplaceRoot: context.marketplaceRoot,
    pluginRoot: context.pluginRoot,
    results
  };
}

/**
 * 创建单个工具的安装计划
 * @param {object} options 创建参数
 * @param {string} options.homeDir 用户目录
 * @param {string} options.marketplaceRoot marketplace 根目录
 * @param {object} options.tool 工具定义
 * @returns {object}
 */
function createToolPlan(options) {
  const { homeDir, marketplaceRoot, tool } = options;
  const toolRoot = path.join(homeDir, tool.rootDirName);

  if (tool.key === 'claude') {
    return {
      tool,
      toolRoot,
      cliCommand: tool.cliCommand,
      knownMarketplacesPath: path.join(toolRoot, 'plugins', 'known_marketplaces.json'),
      installedPluginsPath: path.join(toolRoot, 'plugins', 'installed_plugins.json'),
      marketplaceSource: marketplaceRoot
    };
  }

  return {
    tool,
    toolRoot,
    cliCommand: tool.cliCommand,
    codexConfigPath: path.join(toolRoot, 'config.toml'),
    marketplaceSource: marketplaceRoot
  };
}

/**
 * 写入受管的 marketplace/plugin 目录
 * @param {object} context 安装上下文
 * @returns {Promise<void>}
 */
async function writeManagedMarketplace(context) {
  await ensureDir(context.referenceDir);

  for (const relativePath of context.sourceSkillFiles) {
    const sourcePath = path.join(context.sourceSkillDir, relativePath);
    const targetPath = path.join(context.referenceDir, relativePath);

    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
  }

  for (const command of COMMAND_DEFINITIONS) {
    const commandOptions = {
      command,
      commandGuide: context.commandGuideMap[command.key],
      packageVersion: context.packageMeta.version,
      referenceDir: context.referenceDir
    };

    await writeText(
      path.join(context.pluginRoot, 'commands', `${command.key}.md`),
      buildPluginCommandContent(commandOptions)
    );

    await writeText(
      path.join(context.pluginRoot, 'skills', command.key, 'SKILL.md'),
      buildPluginSkillContent(commandOptions)
    );
  }

  await writeJson(
    path.join(context.marketplaceRoot, '.claude-plugin', 'marketplace.json'),
    buildClaudeMarketplace(context.packageMeta.version)
  );

  await writeJson(
    path.join(context.marketplaceRoot, '.agents', 'plugins', 'marketplace.json'),
    buildCodexMarketplace()
  );

  await writeJson(
    path.join(context.pluginRoot, '.codex-plugin', 'plugin.json'),
    buildCodexPluginManifest(context.packageMeta.version)
  );
}

/**
 * 注册工具
 * @param {object} options 注册参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {string} options.homeDir 用户目录
 * @param {string} options.marketplaceRoot marketplace 根目录
 * @param {object} options.toolPlan 工具计划
 * @returns {Promise<object>}
 */
async function registerTool(options) {
  const { toolPlan } = options;

  if (toolPlan.tool.key === 'claude')
    return registerClaudeTool(options);

  return registerCodexTool(options);
}

/**
 * 注册 Claude Code
 * @param {object} options 注册参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {string} options.homeDir 用户目录
 * @param {object} options.toolPlan 工具计划
 * @returns {Promise<object>}
 */
async function registerClaudeTool(options) {
  const { env, homeDir, toolPlan } = options;
  const marketplaceExists = await isClaudeMarketplaceRegistered(toolPlan.knownMarketplacesPath);

  if (marketplaceExists) {
    await runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'update', MARKETPLACE_NAME], {
      env,
      homeDir
    });
  } else {
    await runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource, '--scope', 'user'], {
      env,
      homeDir
    });
  }

  await runToolCommand(toolPlan.cliCommand, ['plugin', 'install', `${PLUGIN_NAME}@${MARKETPLACE_NAME}`, '--scope', 'user'], {
    env,
    homeDir
  });

  return {
    tool: toolPlan.tool,
    marketplaceStatus: marketplaceExists ? 'updated' : 'added',
    marketplaceSource: toolPlan.marketplaceSource,
    pluginStatus: await isClaudePluginInstalled(toolPlan.installedPluginsPath) ? 'ready' : 'partial',
    status: 'ready'
  };
}

/**
 * 注册 Codex
 * @param {object} options 注册参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {string} options.homeDir 用户目录
 * @param {object} options.toolPlan 工具计划
 * @returns {Promise<object>}
 */
async function registerCodexTool(options) {
  const { env, homeDir, toolPlan } = options;
  const marketplaceExists = await isCodexMarketplaceRegistered(toolPlan.codexConfigPath);

  if (marketplaceExists) {
    await runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'upgrade', MARKETPLACE_NAME], {
      env,
      homeDir
    });
  } else {
    await runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource], {
      env,
      homeDir
    });
  }

  return {
    tool: toolPlan.tool,
    marketplaceStatus: marketplaceExists ? 'updated' : 'added',
    marketplaceSource: toolPlan.marketplaceSource,
    pluginStatus: 'managed_by_marketplace',
    status: 'ready'
  };
}

/**
 * 写入受管 manifest
 * @param {object} options 写入参数
 * @param {object} options.context 安装上下文
 * @param {object[]} options.results 注册结果
 * @returns {Promise<void>}
 */
async function writeManagedManifest(options) {
  const { context, results } = options;

  await writeJson(context.manifestPath, {
    manifestVersion: MANIFEST_VERSION,
    managedBy: PACKAGE_NAME,
    marketplaceName: MARKETPLACE_NAME,
    packageName: context.packageMeta.name,
    packageVersion: context.packageMeta.version,
    pluginName: PLUGIN_NAME,
    installedAt: new Date().toISOString(),
    marketplaceRoot: toPosixPath(context.marketplaceRoot),
    pluginRoot: toPosixPath(context.pluginRoot),
    referenceDir: toPosixPath(context.referenceDir),
    commands: COMMAND_DEFINITIONS.map(command => command.key),
    toolResults: results.map(result => ({
      tool: result.tool.key,
      status: result.status,
      marketplaceStatus: result.marketplaceStatus,
      pluginStatus: result.pluginStatus
    }))
  });
}

/**
 * 读取命令说明文档
 * @param {string} sourceCommandDir 命令目录
 * @returns {Promise<Record<string, string>>}
 */
async function readCommandGuideMap(sourceCommandDir) {
  const commandGuideMap = {};

  for (const command of COMMAND_DEFINITIONS) {
    const guidePath = path.join(sourceCommandDir, `${command.key}.md`);
    const guideContent = await readTextIfExists(guidePath);

    if (guideContent === null)
      throw new Error(`缺少命令说明文件: ${guidePath}`);

    commandGuideMap[command.key] = guideContent.trim();
  }

  return commandGuideMap;
}

/**
 * 构建 Claude marketplace 清单
 * @param {string} version 插件版本
 * @returns {object}
 */
function buildClaudeMarketplace(version) {
  return {
    name: MARKETPLACE_NAME,
    description: 'Aimin 本地命令 marketplace，提供 /am:init、/am:api、/am:plan',
    owner: {
      name: 'Aimin',
      email: 'aimin@example.com'
    },
    plugins: [
      {
        name: PLUGIN_NAME,
        description: 'Aimin 命令插件',
        version,
        author: {
          name: 'Aimin',
          email: 'aimin@example.com'
        },
        source: `./plugins/${PLUGIN_NAME}`,
        category: 'productivity',
        strict: false
      }
    ]
  };
}

/**
 * 构建 Codex marketplace 清单
 * @returns {object}
 */
function buildCodexMarketplace() {
  return {
    name: MARKETPLACE_NAME,
    interface: {
      displayName: 'Aimin Skill'
    },
    plugins: [
      {
        name: PLUGIN_NAME,
        source: {
          source: 'local',
          path: `./plugins/${PLUGIN_NAME}`
        },
        policy: {
          installation: 'INSTALLED_BY_DEFAULT',
          authentication: 'ON_INSTALL'
        },
        category: 'Productivity'
      }
    ]
  };
}

/**
 * 构建 Codex plugin manifest
 * @param {string} version 插件版本
 * @returns {object}
 */
function buildCodexPluginManifest(version) {
  return {
    name: PLUGIN_NAME,
    version,
    description: 'Aimin 本地命令插件',
    skills: './skills/',
    interface: {
      displayName: 'Aimin Skill',
      shortDescription: 'Aimin 命令插件',
      longDescription: '提供 /am:init、/am:api、/am:plan 三个命令。',
      developerName: 'Aimin',
      category: 'Productivity',
      capabilities: ['Interactive', 'Write'],
      defaultPrompt: [
        '用 /am:init 初始化项目规则。',
        '用 /am:api 新增接口。',
        '用 /am:plan 同步线上代码、处理冲突并输出 SOP。'
      ]
    }
  };
}

/**
 * 判断 Claude marketplace 是否已注册
 * @param {string} filePath known_marketplaces.json 路径
 * @returns {Promise<boolean>}
 */
async function isClaudeMarketplaceRegistered(filePath) {
  const marketplaces = await readJsonIfExists(filePath);
  return Boolean(marketplaces?.[MARKETPLACE_NAME]);
}

/**
 * 判断 Claude 插件是否已安装
 * @param {string} filePath installed_plugins.json 路径
 * @returns {Promise<boolean>}
 */
async function isClaudePluginInstalled(filePath) {
  const installedPlugins = await readJsonIfExists(filePath);
  return Boolean(installedPlugins?.plugins?.[`${PLUGIN_NAME}@${MARKETPLACE_NAME}`]?.length);
}

/**
 * 判断 Codex marketplace 是否已注册
 * @param {string} filePath config.toml 路径
 * @returns {Promise<boolean>}
 */
async function isCodexMarketplaceRegistered(filePath) {
  const configText = await readTextIfExists(filePath);
  if (configText === null) return false;
  return configText.includes(`[marketplaces.${MARKETPLACE_NAME}]`);
}

/**
 * 执行外部工具命令
 * @param {string} command 命令名
 * @param {string[]} args 参数列表
 * @param {object} options 执行参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {string} options.homeDir 用户目录
 * @returns {Promise<void>}
 */
async function runToolCommand(command, args, options) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.homeDir,
      env: {
        ...options.env,
        HOME: options.homeDir
      },
      shell: process.platform === 'win32',
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', error => {
      reject(new Error(`执行命令失败 ${command}: ${error.message}`));
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
        return;
      }

      const message = stderr.trim() || stdout.trim() || `退出码: ${code}`;
      reject(new Error(`执行命令失败 ${command} ${args.join(' ')}: ${message}`));
    });
  });
}
