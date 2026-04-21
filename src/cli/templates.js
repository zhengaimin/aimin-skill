/**
 * aimin-skill 命令模板
 * 负责生成 Claude Code 与 Codex 共用的命令文件内容
 */

import path from 'node:path';
import { MANAGED_MARKER } from './constants.js';
import { toPosixPath } from './utils.js';

/**
 * 判断文件内容是否由 aimin-skill 管理
 * @param {string | null} content 文件内容
 * @returns {boolean}
 */
export function isManagedContent(content) {
  if (!content) return false;
  return content.includes(MANAGED_MARKER);
}

/**
 * 生成命令文件内容
 * @param {object} options 生成参数
 * @param {string} options.packageVersion 包版本
 * @param {string} options.skillDir 已安装 skill 目录
 * @param {object} options.tool 目标工具
 * @param {object} options.command 命令定义
 * @returns {string}
 */
export function buildCommandContent(options) {
  const { packageVersion, skillDir, tool, command } = options;
  if (command.key === 'init')
    return buildInitCommandContent({ packageVersion, skillDir, tool, command });

  return buildApiCommandContent({ packageVersion, skillDir, tool, command });
}

/**
 * 生成 init 命令内容
 * @param {object} options 生成参数
 * @param {string} options.packageVersion 包版本
 * @param {string} options.skillDir 已安装 skill 目录
 * @param {object} options.tool 目标工具
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildInitCommandContent(options) {
  const { packageVersion, skillDir, tool, command } = options;
  const skillEntryPath = toPosixPath(path.join(skillDir, 'SKILL.md'));
  const taskGuidePath = toPosixPath(path.join(skillDir, 'command', 'init.md'));
  const namingPath = toPosixPath(path.join(skillDir, 'naming.md'));
  const vuePath = toPosixPath(path.join(skillDir, 'vue.md'));
  const unocssPath = toPosixPath(path.join(skillDir, 'unocss.md'));
  const adminPath = toPosixPath(path.join(skillDir, 'admin', 'rules.md'));
  const tauriPath = toPosixPath(path.join(skillDir, 'tauri', 'rules.md'));
  const uniPath = toPosixPath(path.join(skillDir, 'uni', 'rules.md'));

  return `---
description: ${command.description}
---

<!-- ${MANAGED_MARKER}; tool=${tool.key}; file=${command.fileName}; version=${packageVersion} -->

# ${command.title}

The user invoked this command with: $ARGUMENTS

## Instructions

1. Read the main skill entry at \`${skillEntryPath}\`
2. Read the task guide at \`${taskGuidePath}\`
3. Inspect the current repository before deciding project type or stack
4. Only load extra references when they are relevant:
   - \`${namingPath}\`
   - \`${vuePath}\`
   - \`${unocssPath}\`
   - \`${adminPath}\`
   - \`${tauriPath}\`
   - \`${uniPath}\`
5. Create or update files in the current project workspace, not inside the installed skill directory
6. Keep Aimin constraints: 命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
7. Treat $ARGUMENTS as supplemental context after checking the actual codebase

## Installed Skill

- Tool: ${tool.label}
- Skill root: \`${toPosixPath(skillDir)}\`
- Main guide: \`${skillEntryPath}\`
- Task guide: \`${taskGuidePath}\`

## Example Usage

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 生成 api 命令内容
 * @param {object} options 生成参数
 * @param {string} options.packageVersion 包版本
 * @param {string} options.skillDir 已安装 skill 目录
 * @param {object} options.tool 目标工具
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildApiCommandContent(options) {
  const { packageVersion, skillDir, tool, command } = options;
  const skillEntryPath = toPosixPath(path.join(skillDir, 'SKILL.md'));
  const taskGuidePath = toPosixPath(path.join(skillDir, 'command', 'api.md'));
  const apiPath = toPosixPath(path.join(skillDir, 'api.md'));
  const constantPath = toPosixPath(path.join(skillDir, 'constant.md'));
  const namingPath = toPosixPath(path.join(skillDir, 'naming.md'));
  const indexPath = toPosixPath(path.join(skillDir, 'index', 'constants.json'));

  return `---
description: ${command.description}
---

<!-- ${MANAGED_MARKER}; tool=${tool.key}; file=${command.fileName}; version=${packageVersion} -->

# ${command.title}

The user invoked this command with: $ARGUMENTS

## Instructions

1. Read the main skill entry at \`${skillEntryPath}\`
2. Read the task guide at \`${taskGuidePath}\`
3. Read these references before implementing:
   - \`${apiPath}\`
   - \`${constantPath}\`
   - \`${namingPath}\`
4. Detect the actual module path from the current codebase before creating files
5. If the interface includes enum fields, update the project-side index described in the guide instead of editing the installed template at \`${indexPath}\`
6. Keep Aimin constraints: 命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
7. Treat $ARGUMENTS as supplemental context after checking the actual codebase

## Installed Skill

- Tool: ${tool.label}
- Skill root: \`${toPosixPath(skillDir)}\`
- Main guide: \`${skillEntryPath}\`
- Task guide: \`${taskGuidePath}\`

## Example Usage

\`\`\`
${command.example}
\`\`\`
`;
}
