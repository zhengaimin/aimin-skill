/**
 * aimin-skill CLI 常量
 * 定义安装器的稳定名称、命令与目标工具
 */

export const PACKAGE_NAME = 'aimin-skill';
export const SKILL_NAME = 'aimin-skill';
export const MANIFEST_FILE_NAME = '.aimin-skill-manifest.json';
export const MANIFEST_VERSION = 1;
export const MANAGED_MARKER = 'Managed by aimin-skill';

export const TOOL_DEFINITIONS = [
  {
    key: 'claude',
    label: 'Claude Code',
    rootDirName: '.claude'
  },
  {
    key: 'codex',
    label: 'Codex',
    rootDirName: '.codex'
  }
];

export const COMMAND_DEFINITIONS = [
  {
    key: 'init',
    fileName: 'aimin-init.md',
    slashCommand: '/aimin-init',
    title: 'Aimin Init',
    description: '按 aimin-skill 规范初始化当前项目的 .agent 目录',
    argumentHint: '[project-notes]',
    example: '/aimin-init Vue3 admin 项目，使用 Element Plus + UnoCSS'
  },
  {
    key: 'api',
    fileName: 'aimin-api.md',
    slashCommand: '/aimin-api',
    title: 'Aimin API',
    description: '按 aimin-skill 规范新增接口、类型与枚举',
    argumentHint: '[api-notes]',
    example: '/aimin-api 设备分组列表查询接口，包含状态枚举'
  }
];
