/**
 * aimin-skill 安装诊断
 * 负责汇总 Claude Code 与 Codex 的安装状态
 */

import path from 'node:path';
import { MANIFEST_FILE_NAME, PACKAGE_NAME } from './constants.js';
import { buildInstallContext } from './install.js';
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
    tools.push(await createToolReport(toolPlan));

  return {
    packageMeta: context.packageMeta,
    sourceSkillDir: context.sourceSkillDir,
    tools
  };
}

/**
 * 生成单个工具的诊断结果
 * @param {object} toolPlan 工具安装计划
 * @returns {Promise<object>}
 */
async function createToolReport(toolPlan) {
  const manifest = await readJsonIfExists(toolPlan.manifestPath);
  const skillEntryPath = path.join(toolPlan.skillDir, 'SKILL.md');
  const skillDirExists = await pathExists(toolPlan.skillDir);
  const skillEntryExists = await pathExists(skillEntryPath);
  const manifestManaged = manifest?.managedBy === PACKAGE_NAME;
  const commandReports = [];

  for (const commandPlan of toolPlan.commandPlans) {
    const content = await readTextIfExists(commandPlan.filePath);
    commandReports.push({
      fileName: commandPlan.fileName,
      slashCommand: commandPlan.slashCommand,
      filePath: commandPlan.filePath,
      status: getCommandStatus(content)
    });
  }

  return {
    tool: toolPlan.tool,
    status: getToolStatus({
      skillDirExists,
      skillEntryExists,
      manifestManaged,
      commandReports
    }),
    skillDir: toolPlan.skillDir,
    manifestPath: path.join(toolPlan.skillDir, MANIFEST_FILE_NAME),
    skillStatus: getSkillStatus({
      skillDirExists,
      skillEntryExists,
      manifestManaged
    }),
    commandReports
  };
}

/**
 * 获取命令状态
 * @param {string | null} content 命令文件内容
 * @returns {'missing' | 'ready' | 'conflict'}
 */
function getCommandStatus(content) {
  if (content === null) return 'missing';
  if (isManagedContent(content)) return 'ready';
  return 'conflict';
}

/**
 * 获取 skill 状态
 * @param {object} options 状态参数
 * @param {boolean} options.skillDirExists skill 目录是否存在
 * @param {boolean} options.skillEntryExists SKILL 入口是否存在
 * @param {boolean} options.manifestManaged manifest 是否受管
 * @returns {'missing' | 'ready' | 'partial' | 'conflict'}
 */
function getSkillStatus(options) {
  const { skillDirExists, skillEntryExists, manifestManaged } = options;
  if (!skillDirExists) return 'missing';
  if (skillEntryExists && manifestManaged) return 'ready';
  if (skillEntryExists || manifestManaged) return 'partial';
  return 'conflict';
}

/**
 * 获取工具总体状态
 * @param {object} options 状态参数
 * @param {boolean} options.skillDirExists skill 目录是否存在
 * @param {boolean} options.skillEntryExists SKILL 入口是否存在
 * @param {boolean} options.manifestManaged manifest 是否受管
 * @param {Array<{ status: string }>} options.commandReports 命令报告
 * @returns {'missing' | 'ready' | 'partial' | 'conflict'}
 */
function getToolStatus(options) {
  const { skillDirExists, skillEntryExists, manifestManaged, commandReports } = options;
  const statuses = [
    getSkillStatus({ skillDirExists, skillEntryExists, manifestManaged }),
    ...commandReports.map(commandReport => commandReport.status)
  ];

  if (statuses.every(status => status === 'missing')) return 'missing';
  if (statuses.includes('conflict')) return 'conflict';
  if (statuses.every(status => status === 'ready')) return 'ready';
  return 'partial';
}
