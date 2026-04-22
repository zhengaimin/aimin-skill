/**
 * aimin-skill 模板生成
 * 负责生成 plugin 命令与 Codex plugin skills 内容
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
 * 生成 Claude plugin 命令内容
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.packageVersion 包版本
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
export function buildPluginCommandContent(options) {
  const { command, packageVersion } = options;

  return `---
description: ${command.description}
---

<!-- ${MANAGED_MARKER}; kind=plugin-command; file=${command.key}.md; version=${packageVersion} -->

${buildPromptBody(options)}
`;
}

/**
 * 生成 Codex plugin skill 内容
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.packageVersion 包版本
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
export function buildPluginSkillContent(options) {
  const { command, packageVersion } = options;

  return `---
name: ${command.key}
description: ${command.description}
---

<!-- ${MANAGED_MARKER}; kind=plugin-skill; file=${command.key}/SKILL.md; version=${packageVersion} -->

${buildPromptBody(options)}
`;
}

/**
 * 生成命令主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildPromptBody(options) {
  const { command } = options;

  if (command.key === 'init') return buildInitPromptBody(options);
  if (command.key === 'api') return buildApiPromptBody(options);
  return buildPlanPromptBody(options);
}

/**
 * 生成 init 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildInitPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const skillReadmePath = getReferencePath(referenceDir, 'README.md');
  const projectReadmePath = getReferencePath(referenceDir, 'project', 'README.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'project', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'project', 'CLAUDE.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const vuePath = getReferencePath(referenceDir, 'vue.md');
  const unocssPath = getReferencePath(referenceDir, 'unocss.md');
  const adminPath = getReferencePath(referenceDir, 'admin', 'rules.md');
  const tauriPath = getReferencePath(referenceDir, 'tauri', 'rules.md');
  const uniPath = getReferencePath(referenceDir, 'uni', 'rules.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'index', 'utils.json');
  const lintGuidePath = getReferencePath(referenceDir, 'project', 'scripts', 'lint.md');

  return `# ${command.title}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再判断项目类型与技术栈
3. 只创建或更新项目侧的 \`AGENTS.md\`、\`CLAUDE.md\` 和 \`.agent/\`，不要修改已安装的参考目录
4. \`AGENTS.md\` 与 \`CLAUDE.md\` 必须保持轻量，只做路由与边界说明，不要把全部规则直接展开
5. 初始化完成后，优先以项目侧 \`.agent/**\` 作为事实来源；只有项目文件缺失时才回退参考安装内容
6. 仅在命中对应场景时按需扩读以下参考：
   - \`${skillReadmePath}\`
   - \`${projectReadmePath}\`
   - \`${projectAgentsPath}\`
   - \`${projectClaudePath}\`
   - \`${apiPath}\`
   - \`${constantPath}\`
   - \`${namingPath}\`
   - \`${vuePath}\`
   - \`${unocssPath}\`
   - \`${adminPath}\`
   - \`${tauriPath}\`
   - \`${uniPath}\`
   - \`${constantsIndexPath}\`
   - \`${utilsIndexPath}\`
   - \`${lintGuidePath}\`
7. 保持 Aimin 约束：命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
8. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 项目 README 模板：\`${projectReadmePath}\`
- 项目 AGENTS 模板：\`${projectAgentsPath}\`
- 项目 CLAUDE 模板：\`${projectClaudePath}\`
- 常量索引模板：\`${constantsIndexPath}\`
- 公共方法索引模板：\`${utilsIndexPath}\`
- Lint SOP 模板：\`${lintGuidePath}\`

## 命令说明

${commandGuide}

## 示例

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 生成 api 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildApiPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'index', 'utils.json');

  return `# ${command.title}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再决定实际落点
3. 如果项目里已有 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/api.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`，优先以项目侧文件为准
4. 只有项目侧文件缺失或不完整时，才回退参考已安装内容
5. 按需阅读以下参考：
   - \`${apiPath}\`
   - \`${constantPath}\`
   - \`${namingPath}\`
6. 先从当前代码仓库识别真实接口目录，再新增或更新文件
7. 如果接口包含枚举字段，更新项目侧索引，不要直接修改参考模板 \`${constantsIndexPath}\`
8. 如果任务引入或修改了共享工具方法，同步项目侧公共方法索引，不要直接修改参考模板 \`${utilsIndexPath}\`
9. 保持 Aimin 约束：命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
10. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 接口规范：\`${apiPath}\`
- 常量索引模板：\`${constantsIndexPath}\`
- 公共方法索引模板：\`${utilsIndexPath}\`

## 命令说明

${commandGuide}

## 示例

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 生成 plan 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildPlanPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const projectReadmePath = getReferencePath(referenceDir, 'project', 'README.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'project', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'project', 'CLAUDE.md');
  const lintGuidePath = getReferencePath(referenceDir, 'project', 'scripts', 'lint.md');

  return `# ${command.title}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 这个命令是显式触发命令，只有用户主动调用 \`${command.slashCommand}\` 时才生效
2. 先检查当前仓库，再输出 SOP
3. 如果仓库存在远端，优先拉取线上最新代码；出现冲突时先定位并解决冲突，再继续输出 SOP；如果不能拉取，要明确说明原因、当前依据与风险
4. 如果项目里已有 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/README.md\`、\`.agent/scripts/lint.md\`，优先以项目侧文件为准
5. 默认只输出计划，不直接改文件；只有用户明确要求边计划边实现时，才进入落地
6. SOP 必须按顺序输出这 5 段：调研、拆任务、实施、自检、交付
7. 每一段都必须写清：目标、输入、输出、风险或注意事项
8. 如果识别为 admin 项目，SOP 里必须加入删除未使用变量、未使用导入、未使用参数的收尾动作
9. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 项目 README 模板：\`${projectReadmePath}\`
- 项目 AGENTS 模板：\`${projectAgentsPath}\`
- 项目 CLAUDE 模板：\`${projectClaudePath}\`
- Lint SOP 模板：\`${lintGuidePath}\`

## 命令说明

${commandGuide}

## 示例

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 拼接参考路径
 * @param {string} referenceDir 参考目录
 * @param {...string} segments 路径片段
 * @returns {string}
 */
function getReferencePath(referenceDir, ...segments) {
  return toPosixPath(path.join(referenceDir, ...segments));
}
