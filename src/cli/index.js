/**
 * aimin-skill CLI 主入口
 * 负责解析命令、执行安装与输出诊断结果
 */

import os from 'node:os';
import path from 'node:path';
import { createDoctorReport } from './doctor.js';
import { initUserInstall } from './install/index.js';
import { readPackageMeta } from './utils.js';

/**
 * 运行 CLI
 * @param {object} options 运行参数
 * @param {string[]} options.argv 命令参数
 * @param {string} options.cwd 当前目录
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {{ write: (chunk: string) => boolean }} options.stdout 标准输出
 * @param {{ write: (chunk: string) => boolean }} options.stderr 标准错误
 * @param {string} options.repoRoot 仓库根目录
 * @returns {Promise<number>}
 */
export async function runCli(options) {
  const { argv, cwd, stdout, stderr, repoRoot } = options;

  try {
    const packageMeta = await readPackageMeta(repoRoot);
    const command = argv[0];

    if (!command || command === 'help' || command === '--help' || command === '-h') {
      writeLine(stdout, getHelpText(packageMeta.version));
      return 0;
    }

    if (command === '--version' || command === '-v') {
      writeLine(stdout, packageMeta.version);
      return 0;
    }

    if (command === 'init')
      return runInitCommand({ argv: argv.slice(1), cwd, repoRoot, stdout });

    if (command === 'doctor')
      return runDoctorCommand({ argv: argv.slice(1), cwd, repoRoot, stdout });

    writeLine(stderr, `不支持的命令: ${command}`);
    writeLine(stderr, '');
    writeLine(stderr, getHelpText(packageMeta.version));
    return 1;
  } catch (error) {
    writeLine(stderr, `执行失败: ${getErrorMessage(error)}`);
    return 1;
  }
}

/**
 * 执行 init 子命令
 * @param {object} options 执行参数
 * @param {string[]} options.argv 命令参数
 * @param {string} options.cwd 当前目录
 * @param {string} options.repoRoot 仓库根目录
 * @param {{ write: (chunk: string) => boolean }} options.stdout 标准输出
 * @returns {Promise<number>}
 */
async function runInitCommand(options) {
  const parsed = parseSubcommandOptions(options.argv, options.cwd);
  const result = await initUserInstall({
    env: options.env,
    homeDir: parsed.homeDir,
    platform: process.platform,
    repoRoot: options.repoRoot,
    force: parsed.force
  });

  writeLine(options.stdout, `安装完成: ${result.packageMeta.name}@${result.packageMeta.version}`);
  writeLine(options.stdout, `platform: ${result.platform}`);
  writeLine(options.stdout, `marketplace: ${result.marketplaceRoot}`);
  writeLine(options.stdout, `plugin: ${result.pluginRoot}`);
  writeLine(options.stdout, `codex skills: ${result.codexUserSkillRoot}`);
  for (const item of result.results) {
    writeLine(options.stdout, `- ${item.tool.label}: ${item.marketplaceStatus}`);
    writeLine(options.stdout, `  plugin: ${item.pluginStatus}`);
    if (item.tool.key === 'claude')
      writeLine(options.stdout, '  commands: /am:init, /am:api, /am:plan, /am:update, /am:session');
    else
      writeLine(options.stdout, '  skills: $am, $am-init, $am-api, $am-plan, $am-update, $am-session');
  }

  return 0;
}

/**
 * 执行 doctor 子命令
 * @param {object} options 执行参数
 * @param {string[]} options.argv 命令参数
 * @param {string} options.cwd 当前目录
 * @param {string} options.repoRoot 仓库根目录
 * @param {{ write: (chunk: string) => boolean }} options.stdout 标准输出
 * @returns {Promise<number>}
 */
async function runDoctorCommand(options) {
  const parsed = parseSubcommandOptions(options.argv, options.cwd);
  const report = await createDoctorReport({
    homeDir: parsed.homeDir,
    repoRoot: options.repoRoot
  });

  writeLine(options.stdout, `source commands: ${report.commandSourceDir}`);
  writeLine(options.stdout, `marketplace: ${report.marketplaceRoot}`);
  writeLine(options.stdout, `plugin: ${report.pluginRoot}`);
  for (const toolReport of report.tools) {
    writeLine(options.stdout, `[${toolReport.status}] ${toolReport.tool.label}`);
    writeLine(options.stdout, `bundle: ${toolReport.bundleStatus}`);
    writeLine(options.stdout, `marketplace: ${toolReport.marketplaceRegistered ? 'ready' : 'missing'}`);
    writeLine(options.stdout, `plugin: ${toolReport.pluginInstalled ? 'ready' : 'missing'}`);

    for (const commandReport of toolReport.commandReports)
      writeLine(
        options.stdout,
        `command: ${commandReport.commandStatus}/${commandReport.skillStatus} -> ${commandReport.slashCommand} (${commandReport.commandFilePath})`
      );

    for (const skillReport of toolReport.codexUserSkillReports ?? [])
      writeLine(
        options.stdout,
        `skill: ${skillReport.skillStatus} -> ${skillReport.skillLabel} (${skillReport.skillFilePath})`
      );
  }

  return report.tools.some(toolReport => toolReport.status === 'conflict') ? 1 : 0;
}

/**
 * 解析子命令选项
 * @param {string[]} argv 原始参数
 * @param {string} cwd 当前目录
 * @returns {{ force: boolean; homeDir: string }}
 */
function parseSubcommandOptions(argv, cwd) {
  let force = false;
  let homeDir = os.homedir();

  for (let index = 0; index < argv.length; index += 1) {
    const currentArg = argv[index];

    if (currentArg === '--user') continue;

    if (currentArg === '--force') {
      force = true;
      continue;
    }

    if (currentArg === '--home') {
      const nextArg = argv[index + 1];
      if (!nextArg) throw new Error('参数 --home 缺少目录值');
      homeDir = path.resolve(cwd, nextArg);
      index += 1;
      continue;
    }

    throw new Error(`不支持的参数: ${currentArg}`);
  }

  return {
    force,
    homeDir
  };
}

/**
 * 生成帮助文案
 * @param {string} version 当前版本
 * @returns {string}
 */
function getHelpText(version) {
  return `aimin-skill ${version}

用法:
  aimin-skill init [--user] [--force]
  aimin-skill doctor [--user]

说明:
  init    生成本地 marketplace/plugin，并注册到 Claude Code 与 Codex
  doctor  检查当前用户目录下的 marketplace/plugin 安装状态

示例:
  aimin-skill init
  aimin-skill init --force
  aimin-skill doctor`;
}

/**
 * 输出单行文本
 * @param {{ write: (chunk: string) => boolean }} stream 输出流
 * @param {string} line 单行文本
 * @returns {void}
 */
function writeLine(stream, line) {
  stream.write(`${line}\n`);
}

/**
 * 提取错误消息
 * @param {unknown} error 错误对象
 * @returns {string}
 */
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
