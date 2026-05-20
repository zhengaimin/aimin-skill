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
2. 将任务路由到以下八类之一：
   - 初始化项目根文档、api/comment/naming 规则、索引、lint 脚本和技术栈目录：按 \`$am-init\` 的流程执行
   - 新增或更新接口、类型、枚举：按 \`$am-api\` 的流程执行
   - 根据产品 prompt 生成 \`.agent/ui/{feature-name}/\` 需求文档包：按 \`$am-requirement\` 的流程执行
   - 根据 \`.agent/ui/{feature-name}/\` 需求文档生成 Pencil UI 设计稿：按 \`$am-design\` 的流程执行
   - 提取功能点或页面的关键点，并按需维护项目 \`AGENTS.md\` 的项目级规则表：按 \`$am-archive\` 的流程执行
   - 将当前会话整理到 \`.agent/archive/sessions/\`：按 \`$am-session\` 的流程执行
   - 按 Aimin 与阿里风格 review 当前代码：按 \`$am-review\` 的流程执行
   - 升级项目侧 \`.agent/**\` 与 \`AGENTS.md\`：按 \`$am-update\` 的流程执行
3. 如果用户消息里已经明确出现 am:update、$am-update、规则升级、版本更新、升级 .agent、升级 AGENTS.md、强制更新 .agent，直接走升级流程。
4. 如果用户消息里已经明确出现 am:archive、$am-archive、archive、关键点、功能点、页面、修改前阅读、预读、输出到 .agent/archive，直接走关键点归档流程。
5. 如果用户消息里已经明确出现 session、会话、整理当前对话、会话记录、输出到 .agent/archive/sessions，直接走会话归档流程。
6. 如果用户消息里已经明确出现 review、代码审查、代码评审、阿里风格检查、优化建议、改动建议，直接走 review 流程。
7. 如果用户消息里已经明确出现 init、初始化、AGENTS.md、CLAUDE.md、api.md、comment.md、naming.md、index、constants、utils、lint.md、admin、tauri、uni，直接走初始化流程。
8. 如果用户消息里已经明确出现 api、接口、type、类型、enum、枚举，直接走接口流程。
9. 如果用户消息里已经明确出现 design、设计、UI、Pencil、界面设计、设计稿，并且提到需求文档、\`.agent/ui\` 或功能目录，直接走设计生成流程。
10. 如果用户消息里已经明确出现 requirement、需求生成、PRD、产品想法、prompt、需求文档、需求分析，直接走需求生成流程。
11. 如果仍然无法判断，用一句话要求用户补充目标，并提示可用入口：\`$am-init\`、\`$am-api\`、\`$am-requirement\`、\`$am-design\`、\`$am-archive\`、\`$am-session\`、\`$am-review\`、\`$am-update\`。
12. 路由完成后，直接按对应流程落地，不要只停留在“建议使用哪个 skill”。

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 规则总览：\`${readmePath}\`

## 初始化流程摘要

${commandGuideMap.init}

## 接口流程摘要

${commandGuideMap.api}

## 需求生成流程摘要

${commandGuideMap.requirement}

## 设计生成流程摘要

${commandGuideMap.design}

## Review 流程摘要

${commandGuideMap.review}

## 升级流程摘要

${commandGuideMap.update}

## 关键点归档流程摘要

${commandGuideMap.archive}

## 会话归档流程摘要

${commandGuideMap.session}

## 示例

\`\`\`
$am init 当前 admin 项目，初始化 AGENTS.md、CLAUDE.md、.agent/api、.agent/comment、.agent/naming、.agent/index、.agent/scripts 和 .agent/admin
$am-requirement 设计一个面向独立音乐人的移动端音乐 App
$am-design music-app design-source=codex
$am-archive 归档订单详情页，记录关键状态、修改前必读项并同步项目规则
$am-review 检查当前工作区改动是否符合阿里风格
$am-update 升级当前项目 .agent 与 AGENTS.md
$am-session 归档当前会话
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
  return buildPromptBody({
    ...options,
    codexUserSkillLabel: options.entryLabel,
    surfaceType: 'codex-user-skill'
  });
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
const PROMPT_BODY_BUILDERS = {
  api: buildApiPromptBody,
  archive: buildArchivePromptBody,
  design: buildDesignPromptBody,
  init: buildInitPromptBody,
  requirement: buildRequirementPromptBody,
  review: buildReviewPromptBody,
  session: buildSessionPromptBody,
  update: buildUpdatePromptBody
};

/**
 * 生成命令参数说明
 * @param {object} options 生成参数
 * @param {string} [options.codexUserSkillLabel] Codex user skill 入口
 * @returns {string}
 */
function buildCommandArgumentLine(options) {
  if (options.codexUserSkillLabel)
    return `用户通过 \`${options.codexUserSkillLabel}\` 主动调用本 skill。用户当前消息就是本次任务的补充上下文。`;

  return '用户调用命令参数：$ARGUMENTS';
}

function buildPromptBody(options) {
  const { command } = options;
  const builder = PROMPT_BODY_BUILDERS[command.key];

  if (!builder)
    throw new Error(`不支持的命令模板: ${command.key}`);

  return builder(options);
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
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'template', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'template', 'CLAUDE.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'utils.json');
  const lintGuidePath = getReferencePath(referenceDir, 'template', 'scripts', 'lint.md');
  const adminRulePath = getReferencePath(referenceDir, 'template', 'admin', 'rules.md');
  const adminTablePath = getReferencePath(referenceDir, 'template', 'admin', 'table.md');
  const adminModalPath = getReferencePath(referenceDir, 'template', 'admin', 'modal.md');
  const tauriRulePath = getReferencePath(referenceDir, 'template', 'tauri', 'rules.md');
  const uniRulePath = getReferencePath(referenceDir, 'template', 'uni', 'rules.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再判断当前项目主类型
3. 固定创建或更新这些项目文件：\`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/api.md\`、\`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`、\`.agent/scripts/lint.md\`
4. 本次初始化管理的 \`.agent/**\` 文件必须带版本号；如果目标文件缺少版本号或版本号与参考文件不一致，直接用参考文件强制更新
5. 再按当前项目主类型在以下目录中最多选择一组并创建或更新：
   - admin 项目：\`.agent/admin/rules.md\`、\`.agent/admin/table.md\`、\`.agent/admin/modal.md\`
   - tauri 项目：\`.agent/tauri/rules.md\`
   - uni 项目：\`.agent/uni/rules.md\`
6. 识别项目类型时优先看真实仓库特征：
   - admin：存在后台管理目录结构、\`src/views/**\`、\`src/api/modules/**\`、Element Plus / ProTable / admin 约定
   - tauri：存在 \`src-tauri/\`、\`tauri.conf.json\`、\`Cargo.toml\`、\`@tauri-apps/*\`
   - uni：存在 \`pages.json\`、\`manifest.json\`、\`uni_modules/\`、\`uni.*\` API
7. 如果未命中 admin、tauri、uni，技术栈目录不要创建
8. 如果缺少父目录，只补根目录 \`AGENTS.md\`、\`CLAUDE.md\`，以及 \`.agent/\`、\`.agent/index/\`、\`.agent/scripts/\` 和命中的 \`.agent/admin/\`、\`.agent/tauri/\`、\`.agent/uni/\`
9. \`AGENTS.md\` 与 \`CLAUDE.md\` 以参考模板为基线创建或更新，只更新 \`# Aimin-skill\` 顶级标题下的受管段落；项目独有的其它顶级标题、规则和内容不要改动
10. \`AGENTS.md\` 与 \`CLAUDE.md\` 优先引用当前项目已有或本次初始化生成的规则文件，不要把不存在的 \`.agent/**\` 文件写成硬依赖
11. 不要创建或修改根目录 \`.gitignore\`
12. 不要创建 \`.agent/README.md\`，也不要创建 \`.agent/constant.md\`、\`.agent/vue.md\`、\`.agent/unocss.md\`
13. \`skills/template/\` 是初始化模板目录；初始化时将其中内容放到目标项目对应位置，再按版本规则更新 \`.agent/**\` 文件。\`AGENTS.md\` 与 \`CLAUDE.md\` 默认保留参考模板原有标题、结构和路由，不要把模板整体改写成另一份文档
14. 如果需要添加项目自己的规则，应在 \`.agent/\` 下重新开一个一级目录，使用 \`# {projectname}\` 作为标题，并在该目录下展开项目专属约定
15. \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/api.md\`、\`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/index/**\`、\`.agent/scripts/lint.md\` 与命中的技术栈目录必须保持项目自有文件；根文档只做受管段落更新，\`.agent/**\` 受管文件按版本号决定是否强制更新
16. 仅在命中对应场景时按需参考：\`${projectAgentsPath}\`、\`${projectClaudePath}\`、\`${apiPath}\`、\`${commentPath}\`、\`${namingPath}\`、\`${constantsIndexPath}\`、\`${utilsIndexPath}\`、\`${lintGuidePath}\`、\`${adminRulePath}\`、\`${adminTablePath}\`、\`${adminModalPath}\`、\`${tauriRulePath}\`、\`${uniRulePath}\`
17. 保持 Aimin 约束：命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
18. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 项目 AGENTS 模板：\`${projectAgentsPath}\`
- 项目 CLAUDE 模板：\`${projectClaudePath}\`
- 接口规范模板：\`${apiPath}\`
- 注释规范模板：\`${commentPath}\`
- 命名规范模板：\`${namingPath}\`
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
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'utils.json');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再决定实际落点
3. 如果项目里已有 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/api.md\`、\`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`，优先以项目侧文件为准
4. \`.agent/api.md\`、\`.agent/comment.md\`、\`.agent/constant.md\`、\`.agent/naming.md\` 以及技术栈规则默认只读，不要在接口任务里改写这些规则文件
5. 按需阅读以下参考：
   - \`${apiPath}\`
   - \`${commentPath}\`
   - \`${constantPath}\`
   - \`${namingPath}\`
6. 先从当前代码仓库识别真实接口目录，再新增或更新文件
7. 如果接口包含枚举字段，更新项目侧索引，不要直接修改规则模板 \`${constantsIndexPath}\`
8. 如果任务引入或修改了共享工具方法，同步项目侧公共方法索引，不要直接修改规则模板 \`${utilsIndexPath}\`
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
 * 生成 requirement 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildRequirementPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const readmePath = getReferencePath(referenceDir, 'README.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 这个命令是显式触发命令，只有用户主动调用 \`${command.slashCommand}\` 时才生效
2. 先阅读主 skill 入口：\`${skillEntryPath}\`
3. 先检查当前项目目录，确认是否已有 \`.agent/ui/\`、相关需求文档或同名功能目录
4. 将 $ARGUMENTS 当成产品想法、prompt、范围约束和目录提示来源
5. 默认把需求包输出到 \`.agent/ui/{feature-name}/\`；如果用户明确指定目录，优先使用用户指定目录
6. 如果 \`.agent/\` 不存在，只创建 \`.agent/ui/{feature-name}/\`，不要顺带初始化 \`AGENTS.md\`、\`CLAUDE.md\` 或其它 \`.agent/**\` 规则文件
7. 必须生成或更新 \`需求分析.md\`、\`线框图.md\`、\`设计说明.md\`、\`开发说明.md\`、\`验收标准.md\`
8. 信息不足时，优先提出最多 3 个关键澄清问题；如果用户要求快速推进，则写明保守假设后继续
9. 只生成需求文档，不生成 Pencil 设计稿，不写前端代码，不修改业务源码
10. 先检查真实项目目录，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 规则总览：\`${readmePath}\`

## 命令说明

${commandGuide}

## 示例

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 生成 design 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildDesignPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const readmePath = getReferencePath(referenceDir, 'README.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 这个命令是显式触发命令，只有用户主动调用 \`${command.slashCommand}\` 时才生效
2. 先阅读主 skill 入口：\`${skillEntryPath}\`
3. 先检查当前项目目录，定位用户指定的 \`.agent/ui/{feature-name}/\` 需求包目录
4. 需求包必须包含 \`需求分析.md\`、\`线框图.md\`、\`设计说明.md\`、\`验收标准.md\`；建议同时读取 \`开发说明.md\`
5. 如果需求文档缺失，停止执行并列出缺失文件；不要跳过需求阶段直接根据一句话想法设计
6. 默认把设计产物输出到 \`.agent/ui/{feature-name}/{design-source}/\`，其中 \`{design-source}\` 默认为 \`codex\`
7. 使用 Pencil 创建或更新 \`{design-source}.pen\`，并维护 \`images/\`、\`svg/\`、\`preview/\`
8. 只根据已有需求文档设计，不补业务规则，不写前端代码，不初始化其它 \`.agent/**\` 规则文件
9. 图标优先使用 Remix Icon；不要用文本符号、临时形状或手绘几何图形假装正式图标
10. Pencil 工具、图标库或资源来源不可用时，先停止并说明阻塞，不要用替代符号糊弄产物
11. 设计完成后对照 \`验收标准.md\` 自查页面齐全度、主流程闭环、状态覆盖、组件一致性、文案一致性和明显对齐/溢出/遮挡问题
12. 先检查真实项目目录，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 规则总览：\`${readmePath}\`

## 命令说明

${commandGuide}

## 示例

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 生成 update 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildUpdatePromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'template', 'AGENTS.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'template', 'index', 'utils.json');
  const lintGuidePath = getReferencePath(referenceDir, 'template', 'scripts', 'lint.md');
  const adminRulePath = getReferencePath(referenceDir, 'template', 'admin', 'rules.md');
  const adminTablePath = getReferencePath(referenceDir, 'template', 'admin', 'table.md');
  const adminModalPath = getReferencePath(referenceDir, 'template', 'admin', 'modal.md');
  const tauriRulePath = getReferencePath(referenceDir, 'template', 'tauri', 'rules.md');
  const uniRulePath = getReferencePath(referenceDir, 'template', 'uni', 'rules.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 这个命令专门升级当前项目里的 \`.agent/**\` 与 \`AGENTS.md\`
2. 先阅读主 skill 入口：\`${skillEntryPath}\`
3. 先检查当前仓库，再判断当前项目主类型
4. 对以下固定目标按版本号检查并升级：\`.agent/api.md\`、\`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`、\`.agent/scripts/lint.md\`
5. 再按当前项目主类型在以下目录中最多选择一组并按版本号升级：
   - admin 项目：\`.agent/admin/rules.md\`、\`.agent/admin/table.md\`、\`.agent/admin/modal.md\`
   - tauri 项目：\`.agent/tauri/rules.md\`
   - uni 项目：\`.agent/uni/rules.md\`
6. \`.agent/**\` 目标文件缺少版本号或版本号与参考文件不一致时，直接用参考文件强制覆盖；版本一致时跳过
7. \`AGENTS.md\` 只更新 \`# Aimin-skill\` 顶级标题下的受管段落；项目独有的其它顶级标题、规则和内容不要改动
8. 如果 \`AGENTS.md\` 不存在，按参考模板创建；如果存在但没有 \`# Aimin-skill\` 段落，只追加该段落
9. 不更新 \`CLAUDE.md\`
10. 不要创建或修改根目录 \`.gitignore\`
11. 不要创建 \`.agent/README.md\`，也不要创建 \`.agent/constant.md\`、\`.agent/vue.md\`、\`.agent/unocss.md\`
12. 仅在命中对应场景时按需参考：\`${projectAgentsPath}\`、\`${apiPath}\`、\`${commentPath}\`、\`${namingPath}\`、\`${constantsIndexPath}\`、\`${utilsIndexPath}\`、\`${lintGuidePath}\`、\`${adminRulePath}\`、\`${adminTablePath}\`、\`${adminModalPath}\`、\`${tauriRulePath}\`、\`${uniRulePath}\`
13. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 项目 AGENTS 模板：\`${projectAgentsPath}\`
- 接口规范模板：\`${apiPath}\`
- 注释规范模板：\`${commentPath}\`
- 命名规范模板：\`${namingPath}\`
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
 * 生成 review 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildReviewPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const lintGuidePath = getReferencePath(referenceDir, 'template', 'scripts', 'lint.md');
  const adminRulePath = getReferencePath(referenceDir, 'template', 'admin', 'rules.md');
  const adminTablePath = getReferencePath(referenceDir, 'template', 'admin', 'table.md');
  const adminModalPath = getReferencePath(referenceDir, 'template', 'admin', 'modal.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 这个命令用于 review 当前代码，只有用户主动调用 \`${command.slashCommand}\` 或 \`${command.key}\` 场景时才生效
2. 先检查当前仓库、用户指定范围和项目规则，再读取待 review 的代码
3. 如果用户指定文件、目录、PR、功能点或改动范围，优先 review 指定范围；未指定时优先 review 当前工作区改动
4. 如果项目里已有 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/api.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`，优先以项目侧文件为准；规则文件按只读处理
5. 项目侧规则缺失时，按需参考：\`${commentPath}\`、\`${namingPath}\`、\`${apiPath}\`、\`${constantPath}\`、\`${lintGuidePath}\`
6. 如果识别为 admin 项目，额外按需参考：\`${adminRulePath}\`、\`${adminTablePath}\`、\`${adminModalPath}\`
7. 默认只输出 review 结果，不直接修改文件；只有用户明确要求“顺手修复”“直接改”“边 review 边改”时，才进入代码修改流程
8. 按阿里风格重点检查：公开 API TSDoc、字段级注释、WHY 注释、TODO/FIXME/HACK 前缀、命名可读性、接口类型、枚举常量、业务边界、未使用代码与必要测试
9. 输出必须 findings 优先，按严重程度排序，并给出文件路径、行号、问题和建议改法
10. 不要泛泛而谈，不要把纯个人偏好写成必须修改项；没有必须修改的问题时明确说明

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 注释规范：\`${commentPath}\`
- 命名规范：\`${namingPath}\`
- 接口规范：\`${apiPath}\`
- 常量与枚举规范：\`${constantPath}\`
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
 * 生成 archive 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildArchivePromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const readmePath = getReferencePath(referenceDir, 'README.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 这个命令是显式触发命令，只有用户主动调用 \`${command.slashCommand}\` 时才生效
2. 先阅读主 skill 入口：\`${skillEntryPath}\`
3. 先检查当前项目目录，再定位现有的 \`AGENTS.md\`、\`.agent/archive/\` 归档和 \`.agent/docs/\` 原始文档；\`.agent/docs/\` 只读，专门存放客户、后台、产品方给的原始资料
4. 如果 \`.agent/archive/\` 不存在，只创建归档所需目录；不要初始化其它 \`.agent/**\` 规则文件
5. 只整理关键点，每条信息必须能影响实现、验收、排查、风险判断或后续修改；正文优先使用 Markdown 表格
6. 内容只按功能点和页面归口；其它问题归入更接近的一类，不再按英文子目录拆分
7. 归档不是按日期新建流水文档，而是按核心规则落到对应文件：先查 \`AGENTS.md\` 项目级规则表、\`.agent/archive/README.md\` 和现有归档，命中则更新对应文件
8. 找不到对应文件时，按功能点或页面的稳定主题新建文件，例如 \`.agent/archive/order-detail.md\`；不要生成日期前缀流水文件
9. 后续修改对应功能点或页面前，必须先读取相关归档文档；找不到精确文档时先读取 \`.agent/archive/README.md\`
10. 只有归档内容需要成为“修改前必读”规则时，才同步维护 \`AGENTS.md\` 的 \`## 项目级别规则\` 表格，固定列为 \`修改范围 / 对应归档文档 / 读取要求 / 备注\`
11. 如果本次任务包含代码修改，先读取对应归档文档和用户 prompt 进行确认，再修改代码；修改完成后，把关键变更、影响和待确认事项回写到对应归档文档
12. 不要把归档结果写到 \`.agent/docs/\`，也不要修改 \`CLAUDE.md\`、\`.agent/index/**\` 或其它规则文件
13. 纯归档请求只写 \`.agent/archive/**\`、\`.agent/archive/README.md\` 和必要的 \`AGENTS.md\` 项目级规则表；包含修改诉求时才进入代码实现
14. 先检查真实项目目录，再把 $ARGUMENTS 当成功能点、页面、文件名、修改诉求或归档重点的补充上下文

## 文档结构

| 部分 | 推荐呈现方式 |
| --- | --- |
| 主题 | 用标题或二列表格记录功能点或页面名称、来源。 |
| 关键结论 | 用“类别 / 内容 / 备注”表格记录必须保留的要点。 |
| 决策与约束 | 用“类型 / 内容 / 影响”表格。 |
| 涉及文件或模块 | 用“路径或模块 / 作用 / 修改前是否必读”表格。 |
| 待确认事项 | 用“事项 / 原因 / 当前状态”表格。 |
| 后续动作 | 用“顺序 / 动作 / 备注”表格。 |

## AGENTS.md 项目级规则

| 修改范围 | 对应归档文档 | 读取要求 | 备注 |
| --- | --- | --- | --- |
| 订单详情页 | \`.agent/archive/order-detail.md\` | 修改前必读 | 先读文档和 prompt 再改代码 |

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 规则总览：\`${readmePath}\`

## 命令说明

${commandGuide}

## 示例

\`\`\`
${command.example}
\`\`\`
`;
}

/**
 * 生成 session 主体
 * @param {object} options 生成参数
 * @param {string} options.commandGuide 命令说明
 * @param {string} options.referenceDir 已安装参考目录
 * @param {object} options.command 命令定义
 * @returns {string}
 */
function buildSessionPromptBody(options) {
  const { commandGuide, referenceDir, command } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const argumentLine = buildCommandArgumentLine(options);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');

  return `# ${heading}

${argumentLine}

## 执行要求

1. 这个命令是显式触发命令，只有用户主动调用 \`${command.slashCommand}\` 时才生效
2. 先从当前会话中提取已经确认的信息，再输出到当前项目 \`.agent/archive/sessions/\` 目录
3. 只归档当前会话可见信息，不补写未确认的需求、接口、代码细节或结论
4. 如果 \`.agent/\` 不存在，只创建 \`.agent/archive/sessions/\`，不要初始化其它规则文件
5. 默认新建 Markdown 文档；如果目标文件已存在，追加 \`-2\`、\`-3\` 等序号后缀，不要覆盖
6. 文档至少包含：会话主题、背景与目标、已确认信息、决策与约束、涉及文件或模块、待确认事项、后续动作
7. 归档正文尽量使用 Markdown 表格：背景与目标、已确认信息、决策与约束、涉及文件或模块、待确认事项、后续动作优先用表格呈现；信息不足时保留对应部分并标注“暂无”或“待确认”
8. 不要修改 \`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/index/**\` 或其它规则文件
9. 不要执行代码实现、格式化或 lint，除非用户在命令参数里明确要求
10. 先检查真实项目目录，再把 $ARGUMENTS 当成文件名、标题或归档重点的补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`

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
