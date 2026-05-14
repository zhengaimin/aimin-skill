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
    key: 'requirement',
    slashCommand: '/am:requirement',
    title: 'AM 需求',
    description: '根据产品 prompt 生成 .agent/ui 需求文档包',
    argumentHint: '[product-prompt]',
    example: '/am:requirement 设计一个面向独立音乐人的移动端音乐 App'
  },
  {
    key: 'design',
    slashCommand: '/am:design',
    title: 'AM 设计',
    description: '根据 .agent/ui 需求文档使用 Pencil 生成 UI 设计稿',
    argumentHint: '[feature-name]',
    example: '/am:design music-app design-source=codex'
  },
  {
    key: 'archive',
    slashCommand: '/am:archive',
    title: 'AM 归档',
    description: '提取功能点或页面的关键点，必要时维护项目 AGENTS.md 的项目级规则表，并输出到 .agent/archive 目录',
    argumentHint: '[archive-notes]',
    example: '/am:archive 归档订单详情页，整理关键状态、交互、修改前必读项并同步更新项目规则'
  },
  {
    key: 'session',
    slashCommand: '/am:session',
    title: 'AM 会话归档',
    description: '将当前会话整理为中文 Markdown 归档，输出到 .agents/archive/sessions 目录',
    argumentHint: '[session-notes]',
    example: '/am:session 归档本次实现讨论'
  },
  {
    key: 'review',
    slashCommand: '/am:review',
    title: 'AM 代码 Review',
    description: '按 Aimin 与阿里风格 review 当前代码，输出问题、优化建议与可改动点',
    argumentHint: '[review-target]',
    example: '/am:review 检查当前工作区改动是否符合阿里风格'
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
    description: 'Aimin Codex 路由技能，按上下文选择初始化、接口、需求、设计、关键点归档、会话归档、代码 review 或升级流程',
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
