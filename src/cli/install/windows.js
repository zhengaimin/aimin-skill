/**
 * Windows 安装执行器
 * 负责按当前平台注册 Claude Code 与 Codex
 */

import { MARKETPLACE_NAME, PLUGIN_NAME } from '../constants.js';

/**
 * 注册当前工具
 * @param {object} options 注册参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {object} options.helpers 工具函数
 * @param {string} options.homeDir 用户目录
 * @param {object} options.toolPlan 工具计划
 * @returns {Promise<object>}
 */
export async function registerPlatformTool(options) {
  const { toolPlan } = options;

  if (toolPlan.tool.key === 'claude')
    return registerClaudeTool(options);

  return registerCodexTool(options);
}

/**
 * 注册 Claude Code
 * @param {object} options 注册参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {object} options.helpers 工具函数
 * @param {string} options.homeDir 用户目录
 * @param {object} options.toolPlan 工具计划
 * @returns {Promise<object>}
 */
async function registerClaudeTool(options) {
  const { env, helpers, homeDir, toolPlan } = options;
  const marketplaceRegistration = await readClaudeMarketplaceRegistration(toolPlan.knownMarketplacesPath, helpers);
  let marketplaceStatus = 'added';

  if (!marketplaceRegistration.registered) {
    await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource, '--scope', 'user'], {
      env,
      homeDir
    });
  } else if (
    isClaudeLocalMarketplaceSourceType(marketplaceRegistration.sourceType)
    && marketplaceRegistration.source === toolPlan.marketplaceSource
  ) {
    try {
      await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'update', MARKETPLACE_NAME], {
        env,
        homeDir
      });
      marketplaceStatus = 'updated';
    } catch {
      await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'remove', MARKETPLACE_NAME], {
        env,
        homeDir
      });
      await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource, '--scope', 'user'], {
        env,
        homeDir
      });
      marketplaceStatus = 're-added';
    }
  } else {
    await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'remove', MARKETPLACE_NAME], {
      env,
      homeDir
    });
    await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource, '--scope', 'user'], {
      env,
      homeDir
    });
    marketplaceStatus = 're-added';
  }

  await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'install', `${PLUGIN_NAME}@${MARKETPLACE_NAME}`, '--scope', 'user'], {
    env,
    homeDir
  });

  return {
    tool: toolPlan.tool,
    marketplaceStatus,
    marketplaceSource: toolPlan.marketplaceSource,
    pluginStatus: await isClaudePluginInstalled(toolPlan.installedPluginsPath, helpers) ? 'ready' : 'partial',
    status: 'ready'
  };
}

/**
 * 注册 Codex
 * @param {object} options 注册参数
 * @param {NodeJS.ProcessEnv} options.env 环境变量
 * @param {object} options.helpers 工具函数
 * @param {string} options.homeDir 用户目录
 * @param {object} options.toolPlan 工具计划
 * @returns {Promise<object>}
 */
async function registerCodexTool(options) {
  const { env, helpers, homeDir, toolPlan } = options;
  const marketplaceRegistration = await readCodexMarketplaceRegistration(toolPlan.codexConfigPath, helpers);
  let marketplaceStatus = 'added';

  if (!marketplaceRegistration.registered) {
    await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource], {
      env,
      homeDir
    });
  } else if (marketplaceRegistration.sourceType === 'local') {
    if (marketplaceRegistration.source !== toolPlan.marketplaceSource) {
      await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'remove', MARKETPLACE_NAME], {
        env,
        homeDir
      });
      await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'add', toolPlan.marketplaceSource], {
        env,
        homeDir
      });
      marketplaceStatus = 're-added';
    } else {
      marketplaceStatus = 'reused';
    }
  } else {
    await helpers.runToolCommand(toolPlan.cliCommand, ['plugin', 'marketplace', 'upgrade', MARKETPLACE_NAME], {
      env,
      homeDir
    });
    marketplaceStatus = 'updated';
  }

  return {
    tool: toolPlan.tool,
    marketplaceStatus,
    marketplaceSource: toolPlan.marketplaceSource,
    pluginStatus: 'managed_by_marketplace',
    userSkillStatus: 'ready',
    status: 'ready'
  };
}

/**
 * 读取 Claude marketplace 注册信息
 * @param {string} filePath known_marketplaces.json 路径
 * @param {object} helpers 工具函数
 * @returns {Promise<{ registered: boolean; source: string | null; sourceType: string | null }>}
 */
async function readClaudeMarketplaceRegistration(filePath, helpers) {
  const marketplaces = await helpers.readJsonIfExists(filePath);
  const registration = marketplaces?.[MARKETPLACE_NAME];

  return {
    registered: Boolean(registration),
    source: registration?.source?.path ?? null,
    sourceType: registration?.source?.source ?? null
  };
}

/**
 * 判断 Claude marketplace 是否为本地目录源
 * @param {string | null} sourceType marketplace 源类型
 * @returns {boolean}
 */
function isClaudeLocalMarketplaceSourceType(sourceType) {
  return sourceType === 'directory' || sourceType === 'local';
}

/**
 * 判断 Claude 插件是否已安装
 * @param {string} filePath installed_plugins.json 路径
 * @param {object} helpers 工具函数
 * @returns {Promise<boolean>}
 */
async function isClaudePluginInstalled(filePath, helpers) {
  const installedPlugins = await helpers.readJsonIfExists(filePath);
  return Boolean(installedPlugins?.plugins?.[`${PLUGIN_NAME}@${MARKETPLACE_NAME}`]?.length);
}

/**
 * 读取 Codex marketplace 注册信息
 * @param {string} filePath config.toml 路径
 * @param {object} helpers 工具函数
 * @returns {Promise<{ registered: boolean; source: string | null; sourceType: string | null }>}
 */
async function readCodexMarketplaceRegistration(filePath, helpers) {
  const configText = await helpers.readTextIfExists(filePath);
  if (configText === null) {
    return {
      registered: false,
      source: null,
      sourceType: null
    };
  }

  const sectionMatch = configText.match(
    new RegExp(`\\[marketplaces\\.${MARKETPLACE_NAME.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\]([\\s\\S]*?)(?:\\n\\[[^\\n]+\\]|$)`)
  );

  if (!sectionMatch) {
    return {
      registered: false,
      source: null,
      sourceType: null
    };
  }

  const sectionText = sectionMatch[1];
  const sourceTypeMatch = sectionText.match(/^\s*source_type\s*=\s*"([^"]+)"/m);
  const sourceMatch = sectionText.match(/^\s*source\s*=\s*"([^"]+)"/m);

  return {
    registered: true,
    source: sourceMatch?.[1] ?? null,
    sourceType: sourceTypeMatch?.[1] ?? null
  };
}
