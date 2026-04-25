/**
 * aimin-skill 模板生成
 * 负责生成 plugin 命令、plugin skills 与 Codex user skills 内容
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

${buildPromptBody({
  ...options,
  surfaceType: 'command'
})}
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

${buildPromptBody({
  ...options,
  surfaceType: 'skill'
})}
`;
}

/**
 * 生成 Codex user skill 内容
 * @param {object} options 生成参数
 * @param {string} options.skillName skill 名称
 * @param {string} options.description skill 描述
 * @param {string} options.packageVersion 包版本
 * @param {string} options.body skill 主体
 * @returns {string}
 */
export function buildCodexUserSkillContent(options) {
  const { body, description, packageVersion, skillName } = options;

  return `---
name: ${skillName}
description: ${description}
---

<!-- ${MANAGED_MARKER}; kind=codex-user-skill; file=${skillName}/SKILL.md; version=${packageVersion} -->

${body}
`;
}

/**
 * 生成 Codex 路由 skill 主体
 * @param {object} options 生成参数
 * @param {Record<string, string>} options.commandGuideMap 命令说明映射
 * @param {string} options.referenceDir 已安装参考目录
 * @returns {string}
 */
export function buildCodexRouterSkillBody(options) {
  const { commandGuideMap, referenceDir } = options;
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const readmePath = getReferencePath(referenceDir, 'README.md');

  return `# AM 路由

这个 skill 只在用户主动使用 \`$am\` 时生效。

## 路由规则

1. 先检查当前仓库，再读取用户当前消息。
2. 将任务路由到以下三类之一：
   - 初始化项目根文档、索引、lint 脚本和技术栈目录：按 \`$am-init\` 的流程执行
   - 新增或更新接口、类型、枚举：按 \`$am-api\` 的流程执行
   - 输出 AI SOP 计划：按 \`$am-plan\` 的流程执行
3. 如果用户消息里已经明确出现 init、初始化、AGENTS.md、CLAUDE.md、index、constants、utils、lint.md、admin、tauri、uni，直接走初始化流程。
4. 如果用户消息里已经明确出现 api、接口、type、类型、enum、枚举，直接走接口流程。
5. 如果用户消息里已经明确出现 plan、计划、SOP、调研、拆任务，直接走计划流程。
6. 如果仍然无法判断，用一句话要求用户补充目标，并提示可用入口：\`$am-init\`、\`$am-api\`、\`$am-plan\`。
7. 路由完成后，直接按对应流程落地，不要只停留在“建议使用哪个 skill”。

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 规则总览：\`${readmePath}\`

## 初始化流程摘要

${commandGuideMap.init}

## 接口流程摘要

${commandGuideMap.api}

## 计划流程摘要

${commandGuideMap.plan}

## 示例

\`\`\`
$am init 当前 admin 项目，初始化 AGENTS.md、CLAUDE.md、.agent/index、.agent/scripts 和 .agent/admin
\`\`\`
`;
}

/**
 * 生成 Codex 命令 skill 主体
 * @param {object} options 生成参数
 * @param {string} options.entryLabel 显式 skill 入口
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
export function buildCodexCommandSkillBody(options) {
  const promptBody = buildPromptBody({
    ...options,
    surfaceType: 'codex-user-skill'
  });

  return promptBody.replace(
    '用户调用命令参数：$ARGUMENTS',
    `用户通过 \`${options.entryLabel}\` 主动调用本 skill。用户当前消息就是本次任务的补充上下文。`
  );
}

/**
 * 生成命令主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {'mac' | 'windows'} [options.platform] 安装平台
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
 * @param {'mac' | 'windows'} [options.platform] 安装平台
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildInitPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'template', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'template', 'CLAUDE.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'utils.json');
  const lintGuidePath = getReferencePath(referenceDir, 'template', 'scripts', 'lint.md');
  const adminRulePath = getReferencePath(referenceDir, 'template', 'admin', 'rules.md');
  const adminTablePath = getReferencePath(referenceDir, 'template', 'admin', 'table.md');
  const adminModalPath = getReferencePath(referenceDir, 'template', 'admin', 'modal.md');
  const tauriRulePath = getReferencePath(referenceDir, 'template', 'tauri', 'rules.md');
  const uniRulePath = getReferencePath(referenceDir, 'template', 'uni', 'rules.md');

  return `# ${heading}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再判断当前项目主类型
3. 固定创建或更新这 5 个项目文件：\`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`、\`.agent/scripts/lint.md\`
4. 再按当前项目主类型在以下目录中最多选择一组并创建或更新：
   - admin 项目：\`.agent/admin/rules.md\`、\`.agent/admin/table.md\`、\`.agent/admin/modal.md\`
   - tauri 项目：\`.agent/tauri/rules.md\`
   - uni 项目：\`.agent/uni/rules.md\`
5. 识别项目类型时优先看真实仓库特征：
   - admin：存在后台管理目录结构、\`src/views/**\`、\`src/api/modules/**\`、Element Plus / ProTable / admin 约定
   - tauri：存在 \`src-tauri/\`、\`tauri.conf.json\`、\`Cargo.toml\`、\`@tauri-apps/*\`
   - uni：存在 \`pages.json\`、\`manifest.json\`、\`uni_modules/\`、\`uni.*\` API
6. 如果未命中 admin、tauri、uni，技术栈目录不要创建
7. 如果缺少父目录，只补根目录 \`AGENTS.md\`、\`CLAUDE.md\`，以及 \`.agent/index/\`、\`.agent/scripts/\` 和命中的 \`.agent/admin/\`、\`.agent/tauri/\`、\`.agent/uni/\`
8. \`AGENTS.md\` 与 \`CLAUDE.md\` 以参考模板为基线创建或更新，只保留入口、边界和路由说明这类根文档内容，优先引用当前项目已有或本次初始化生成的规则文件，不要把不存在的 \`.agent/**\` 文件写成硬依赖
9. 不要创建或修改根目录 \`.gitignore\`
10. 不要创建 \`.agent/README.md\`，也不要创建 \`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/constant.md\`、\`.agent/api.md\`、\`.agent/vue.md\`、\`.agent/unocss.md\`
11. \`skills/template/\` 是初始化模板目录；初始化时将其中内容放到目标项目对应位置，再按额外规则向 \`.agent/**\` 追加内容。\`AGENTS.md\` 与 \`CLAUDE.md\` 默认保留参考模板原有标题、结构和路由，不要把模板整体改写成另一份文档
12. 如果需要添加项目自己的规则，应在 \`.agent/\` 下重新开一个一级目录，使用 \`# {projectname}\` 作为标题，并在该目录下展开项目专属约定
13. \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/index/**\`、\`.agent/scripts/lint.md\` 与命中的技术栈目录必须保持项目自有文件；如果项目里已有相关文件，只做最小增量更新，补齐缺失段落，不要覆盖用户已有内容
14. 仅在命中对应场景时按需参考：\`${projectAgentsPath}\`、\`${projectClaudePath}\`、\`${constantsIndexPath}\`、\`${utilsIndexPath}\`、\`${lintGuidePath}\`、\`${adminRulePath}\`、\`${adminTablePath}\`、\`${adminModalPath}\`、\`${tauriRulePath}\`、\`${uniRulePath}\`
15. 保持 Aimin 约束：命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
16. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 项目 AGENTS 模板：\`${projectAgentsPath}\`
- 项目 CLAUDE 模板：\`${projectClaudePath}\`
- 常量索引模板：\`${constantsIndexPath}\`
- 公共方法索引模板：\`${utilsIndexPath}\`
- Lint SOP 模板：\`${lintGuidePath}\`
- Admin 规则模板：\`${adminRulePath}\`
- Admin 表格模板：\`${adminTablePath}\`
- Admin 弹窗模板：\`${adminModalPath}\`
- Tauri 规则模板：\`${tauriRulePath}\`
- Uni 规则模板：\`${uniRulePath}\`

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
  const heading = getPromptHeading(options.surfaceType, command);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'utils.json');

  return `# ${heading}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再决定实际落点
3. 如果项目里已有 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/api.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`，优先以项目侧文件或项目软链接为准
4. \`.agent/api.md\`、\`.agent/comment.md\`、\`.agent/constant.md\`、\`.agent/naming.md\` 以及技术栈规则通常是共享软链接，默认只读，不要在当前项目里改写这些规则文件
5. 按需阅读以下参考：
   - \`${apiPath}\`
   - \`${commentPath}\`
   - \`${constantPath}\`
   - \`${namingPath}\`
6. 先从当前代码仓库识别真实接口目录，再新增或更新文件
7. 如果接口包含枚举字段，更新项目侧索引，不要直接修改共享规则软链接或参考模板 \`${constantsIndexPath}\`
8. 如果任务引入或修改了共享工具方法，同步项目侧公共方法索引，不要直接修改共享规则软链接或参考模板 \`${utilsIndexPath}\`
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
  const heading = getPromptHeading(options.surfaceType, command);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'template', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'template', 'CLAUDE.md');
  const lintGuidePath = getReferencePath(referenceDir, 'template', 'scripts', 'lint.md');

  return `# ${heading}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 这个命令是显式触发命令，只有用户主动调用 \`${command.slashCommand}\` 时才生效
2. 先检查当前项目代码、目录结构、规则文件与已有实现，再输出 SOP
3. 如果项目里已有 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`、\`.agent/scripts/lint.md\`，优先以项目侧文件为准；共享规则软链接按只读处理
4. 默认只输出计划，不直接改文件；只有用户明确要求边计划边实现时，才进入落地
5. SOP 必须按顺序输出这 5 段：调研、拆任务、实施、自检、交付
6. 每一段都必须写清：目标、输入、输出、风险或注意事项
7. 如果识别为 admin 项目，SOP 里必须加入删除未使用变量、未使用导入、未使用参数的收尾动作
8. 先检查真实项目代码与目录，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
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

/**
 * 获取不同表面形态下的标题
 * @param {'command' | 'skill' | 'codex-user-skill'} surfaceType 表面类型
 * @param {object} command 命令定义
 * @returns {string}
 */
function getPromptHeading(surfaceType, command) {
  if (surfaceType === 'command') return command.slashCommand;
  if (surfaceType === 'codex-user-skill') return command.title;
  return command.title;
}
