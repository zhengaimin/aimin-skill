/**
 * aimin-skill CLI 常量
 * 定义安装器的稳定名称、命令与目标工具
 */

export const PACKAGE_NAME = 'aimin-skill';
export const MARKETPLACE_NAME = 'aimin-skill';
export const PLUGIN_NAME = 'am';
export const MANIFEST_FILE_NAME = '.aimin-skill-manifest.json';
export const MANIFEST_VERSION = 1;
export const MANAGED_MARKER = 'Managed by aimin-skill';

export const TOOL_DEFINITIONS = [
  {
    key: 'claude',
    label: 'Claude Code',
    rootDirName: '.claude',
    cliCommand: 'claude'
  },
  {
    key: 'codex',
    label: 'Codex',
    rootDirName: '.codex',
    cliCommand: 'codex'
  }
];

export const COMMAND_DEFINITIONS = [
  {
    key: 'init',
    slashCommand: '/am:init',
    title: 'AM 初始化',
    description: '按 aimin-skill 规范初始化 AGENTS.md、CLAUDE.md、.agent/api、.agent/comment、.agent/naming、.agent/index、.agent/scripts，并按项目类型包含 admin/tauri/uni',
    argumentHint: '[project-notes]',
    example: '/am:init 当前 admin 项目，初始化 AGENTS.md、CLAUDE.md、.agent/api、.agent/comment、.agent/naming、.agent/index、.agent/scripts 和 .agent/admin'
  },
  {
    key: 'api',
    slashCommand: '/am:api',
    title: 'AM 接口',
    description: '按 aimin-skill 规范新增接口、类型与枚举',
    argumentHint: '[api-notes]',
    example: '/am:api 设备分组列表查询接口，包含状态枚举'
  },
  {
    key: 'plan',
    slashCommand: '/am:plan',
    title: 'AM 计划',
    description: '输出 AI SOP 计划，聚焦当前项目代码与规则，仅在手动调用 /am:plan 时触发',
    argumentHint: '[task-notes]',
    example: '/am:plan 为设备管理页新增批量分组能力，先输出实施 SOP'
  },
  {
    key: 'update',
    slashCommand: '/am:update',
    title: 'AM Update',
    description: '按版本号强制升级项目侧 .agent 规则，并只更新 AGENTS.md 的 # Aimin-skill 段落',
    argumentHint: '[update-notes]',
    example: '/am:update 升级当前项目 .agent 与 AGENTS.md'
  }
];

export const CODEX_USER_SKILL_DEFINITIONS = [
  {
    key: 'am',
    skillName: 'am',
    label: '$am',
    type: 'router',
    description: 'Aimin Codex 路由技能，按上下文选择初始化、接口或计划流程',
    example: '$am init 当前 admin 项目，初始化 AGENTS.md、CLAUDE.md、.agent/api、.agent/comment、.agent/naming、.agent/index、.agent/scripts 和 .agent/admin'
  },
  ...COMMAND_DEFINITIONS.map(command => ({
    key: `am-${command.key}`,
    skillName: `am-${command.key}`,
    label: `$am-${command.key}`,
    type: 'command',
    commandKey: command.key,
    description: command.description,
    example: command.example.replace(command.slashCommand, `$am-${command.key}`)
  }))
];
