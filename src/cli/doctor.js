/**
 * aimin-skill 安装诊断
 * 负责汇总 Claude Code 与 Codex 的 marketplace/plugin 安装状态
 */

import path from 'node:path';
import { CODEX_USER_SKILL_DEFINITIONS, COMMAND_DEFINITIONS, MANIFEST_FILE_NAME, MARKETPLACE_NAME, PLUGIN_NAME } from './constants.js';
import { buildInstallContext } from './install/index.js';
import { isManagedContent } from './templates.js';
import { pathExists, readJsonIfExists, readTextIfExists } from './utils.js';

/**
 * 生成安装诊断报告
 * @param {object} options 诊断参数
 * @param {string} options.homeDir 用户目录
 * @param {string} options.repoRoot 仓库根目录
 * @returns {Promise<object>}
 */
export async function createDoctorReport(options) {
  const context = await buildInstallContext(options);
  const tools = [];

  for (const toolPlan of context.toolPlans)
    tools.push(await createToolReport(context, toolPlan));

  return {
    commandSourceDir: path.join(options.repoRoot, 'commands'),
    manifestPath: context.manifestPath,
    marketplaceRoot: context.marketplaceRoot,
    pluginRoot: context.pluginRoot,
    packageMeta: context.packageMeta,
    tools
  };
}

/**
 * 生成单个工具的诊断结果
 * @param {object} context 安装上下文
 * @param {object} toolPlan 工具安装计划
 * @returns {Promise<object>}
 */
async function createToolReport(context, toolPlan) {
  const manifest = await readJsonIfExists(context.manifestPath);
  const manifestManaged = manifest?.managedBy === 'aimin-skill';
  const marketplaceRootExists = await pathExists(context.marketplaceRoot);
  const pluginRootExists = await pathExists(context.pluginRoot);
  const commandReports = [];
  const codexUserSkillReports = [];

  for (const command of COMMAND_DEFINITIONS) {
    const commandFilePath = path.join(context.pluginRoot, 'commands', `${command.key}.md`);
    const skillFilePath = path.join(context.pluginRoot, 'skills', command.key, 'SKILL.md');
    const commandContent = await readTextIfExists(commandFilePath);
    const skillContent = await readTextIfExists(skillFilePath);

    commandReports.push({
      slashCommand: command.slashCommand,
      commandFilePath,
      skillFilePath,
      commandStatus: getManagedFileStatus(commandContent),
      skillStatus: getManagedFileStatus(skillContent)
    });
  }

  if (toolPlan.tool.key === 'claude') {
    const knownMarketplaces = await readJsonIfExists(toolPlan.knownMarketplacesPath);
    const installedPlugins = await readJsonIfExists(toolPlan.installedPluginsPath);
    const marketplaceRegistered = Boolean(knownMarketplaces?.[MARKETPLACE_NAME]);
    const pluginInstalled = Boolean(installedPlugins?.plugins?.[`${PLUGIN_NAME}@${MARKETPLACE_NAME}`]?.length);

    return {
      tool: toolPlan.tool,
      status: getToolStatus({
        commandReports,
        marketplaceRegistered,
        manifestManaged,
        marketplaceRootExists,
        pluginInstalled,
        pluginRootExists
      }),
      bundleStatus: getBundleStatus({
        commandReports,
        manifestManaged,
        marketplaceRootExists,
        pluginRootExists
      }),
      marketplaceRegistered,
      pluginInstalled,
      marketplaceSource: toolPlan.marketplaceSource,
      commandReports,
      codexUserSkillReports
    };
  }

  for (const skillDefinition of CODEX_USER_SKILL_DEFINITIONS) {
    const skillFilePath = path.join(toolPlan.toolRoot, 'skills', skillDefinition.skillName, 'SKILL.md');
    const skillContent = await readTextIfExists(skillFilePath);

    codexUserSkillReports.push({
      skillLabel: skillDefinition.label,
      skillFilePath,
      skillStatus: getManagedFileStatus(skillContent)
    });
  }

  const codexConfigText = await readTextIfExists(toolPlan.codexConfigPath);
  const marketplaceRegistered = codexConfigText?.includes(`[marketplaces.${MARKETPLACE_NAME}]`) ?? false;

  return {
    tool: toolPlan.tool,
    status: getToolStatus({
      commandReports,
      codexUserSkillReports,
      marketplaceRegistered,
      manifestManaged,
      marketplaceRootExists,
      pluginInstalled: marketplaceRegistered,
      pluginRootExists
    }),
    bundleStatus: getBundleStatus({
      commandReports,
      codexUserSkillReports,
      manifestManaged,
      marketplaceRootExists,
      pluginRootExists
    }),
    marketplaceRegistered,
    pluginInstalled: marketplaceRegistered,
    marketplaceSource: toolPlan.marketplaceSource,
    commandReports,
    codexUserSkillReports
  };
}

/**
 * 获取受管文件状态
 * @param {string | null} content 文件内容
 * @returns {'missing' | 'ready' | 'conflict'}
 */
function getManagedFileStatus(content) {
  if (content === null) return 'missing';
  if (isManagedContent(content)) return 'ready';
  return 'conflict';
}

/**
 * 获取 bundle 状态
 * @param {object} options 状态参数
 * @param {Array<{ commandStatus: string; skillStatus: string }>} options.commandReports 命令报告
 * @param {Array<{ skillStatus: string }>} [options.codexUserSkillReports] Codex user skill 报告
 * @param {boolean} options.manifestManaged manifest 是否受管
 * @param {boolean} options.marketplaceRootExists marketplace 根目录是否存在
 * @param {boolean} options.pluginRootExists plugin 根目录是否存在
 * @returns {'missing' | 'ready' | 'partial' | 'conflict'}
 */
function getBundleStatus(options) {
  const { codexUserSkillReports = [], commandReports, manifestManaged, marketplaceRootExists, pluginRootExists } = options;
  const statuses = [
    marketplaceRootExists ? 'ready' : 'missing',
    pluginRootExists ? 'ready' : 'missing',
    manifestManaged ? 'ready' : 'missing',
    ...commandReports.map(commandReport => commandReport.commandStatus),
    ...commandReports.map(commandReport => commandReport.skillStatus),
    ...codexUserSkillReports.map(skillReport => skillReport.skillStatus)
  ];

  if (statuses.every(status => status === 'missing')) return 'missing';
  if (statuses.includes('conflict')) return 'conflict';
  if (statuses.every(status => status === 'ready')) return 'ready';
  return 'partial';
}

/**
 * 获取工具总体状态
 * @param {object} options 状态参数
 * @param {Array<{ commandStatus: string; skillStatus: string }>} options.commandReports 命令报告
 * @param {Array<{ skillStatus: string }>} [options.codexUserSkillReports] Codex user skill 报告
 * @param {boolean} options.marketplaceRegistered marketplace 是否已注册
 * @param {boolean} options.manifestManaged manifest 是否受管
 * @param {boolean} options.marketplaceRootExists marketplace 根目录是否存在
 * @param {boolean} options.pluginInstalled 插件是否就绪
 * @param {boolean} options.pluginRootExists plugin 根目录是否存在
 * @returns {'missing' | 'ready' | 'partial' | 'conflict'}
 */
function getToolStatus(options) {
  const {
    codexUserSkillReports = [],
    commandReports,
    marketplaceRegistered,
    manifestManaged,
    marketplaceRootExists,
    pluginInstalled,
    pluginRootExists
  } = options;
  const statuses = [
    getBundleStatus({
      codexUserSkillReports,
      commandReports,
      manifestManaged,
      marketplaceRootExists,
      pluginRootExists
    }),
    marketplaceRegistered ? 'ready' : 'missing',
    pluginInstalled ? 'ready' : 'missing'
  ];

  if (statuses.every(status => status === 'missing')) return 'missing';
  if (statuses.includes('conflict')) return 'conflict';
  if (statuses.every(status => status === 'ready')) return 'ready';
  return 'partial';
}
