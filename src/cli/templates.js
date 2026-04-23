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
   - 初始化项目规则：按 \`$am-init\` 的流程执行
   - 新增或更新接口、类型、枚举：按 \`$am-api\` 的流程执行
   - 输出 AI SOP 计划：按 \`$am-plan\` 的流程执行
3. 如果用户消息里已经明确出现 init、初始化、AGENTS、CLAUDE、.agent，直接走初始化流程。
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
$am init 当前 Rust 项目，初始化 AGENTS.md + CLAUDE.md + .agent
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
  const { commandGuide, referenceDir, command, platform = 'mac' } = options;
  const heading = getPromptHeading(options.surfaceType, command);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const skillReadmePath = getReferencePath(referenceDir, 'README.md');
  const projectAgentsPath = getReferencePath(referenceDir, 'project', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'project', 'CLAUDE.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const vuePath = getReferencePath(referenceDir, 'vue.md');
  const unocssPath = getReferencePath(referenceDir, 'unocss.md');
  const adminPath = getReferencePath(referenceDir, 'admin', 'rules.md');
  const adminTablePath = getReferencePath(referenceDir, 'admin', 'table.md');
  const adminModalPath = getReferencePath(referenceDir, 'admin', 'modal.md');
  const tauriPath = getReferencePath(referenceDir, 'tauri', 'rules.md');
  const uniPath = getReferencePath(referenceDir, 'uni', 'rules.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'index', 'utils.json');
  const lintGuidePath = getReferencePath(referenceDir, 'project', 'scripts', 'lint.md');
  const sharedRuleLinkStrategy = getSharedRuleLinkStrategy(platform);

  return `# ${heading}

用户调用命令参数：$ARGUMENTS

## 执行要求

1. 先阅读主 skill 入口：\`${skillEntryPath}\`
2. 先检查当前仓库，再判断项目类型与技术栈
3. 初始化时必须增量维护项目根目录 \`.gitignore\`；如果缺少以下区块就补齐且不要重复添加：
   \`\`\`
   # ai
   .agent
   AGENTS.md
   CLAUDE.md
   \`\`\`
4. 项目自有文件只创建或更新这些：\`AGENTS.md\`、\`CLAUDE.md\`、\`.agent/index/constants.json\`、\`.agent/index/utils.json\`、\`.agent/scripts/lint.md\`
5. 除上述文件外，禁止新增任何项目侧 \`.agent/**\` 普通文件；尤其不要创建 \`.agent/README.md\`，也不要生成项目定制版 \`.agent/naming.md\`、\`.agent/constant.md\`、\`.agent/api.md\`、\`.agent/tauri/rules.md\`
6. \`AGENTS.md\` 与 \`CLAUDE.md\` 必须保持轻量，只做路由与边界说明，不要把全部规则直接展开
7. 通用规则文件不要复制到项目里；优先把以下项目路径创建为指向已安装参考文件的软链接，并按只读规则使用：
   - \`.agent/comment.md\` -> \`${commentPath}\`
   - \`.agent/naming.md\` -> \`${namingPath}\`
   - \`.agent/constant.md\` -> \`${constantPath}\`
   - \`.agent/api.md\` -> \`${apiPath}\`
   - 识别为 Vue 项目时再追加 \`.agent/vue.md\` -> \`${vuePath}\`
   - 识别为 UnoCSS 项目时再追加 \`.agent/unocss.md\` -> \`${unocssPath}\`
   - 识别为 admin 项目时再追加 \`.agent/admin/rules.md\` -> \`${adminPath}\`、\`.agent/admin/table.md\` -> \`${adminTablePath}\`、\`.agent/admin/modal.md\` -> \`${adminModalPath}\`
   - 识别为 tauri 项目时再追加 \`.agent/tauri/rules.md\` -> \`${tauriPath}\`
   - 识别为 uni 项目时再追加 \`.agent/uni/rules.md\` -> \`${uniPath}\`
8. 初始化完成后，项目自有文件优先；共享软链接只用于读取规则，禁止直接修改已安装的参考目录，也禁止因为“技术栈定制”而把这些共享规则改写成项目普通文件
9. 软链接创建策略：
${sharedRuleLinkStrategy}
10. 硬性验收：结束前必须逐项检查以下条件，任何一项不满足都视为初始化失败并需要继续修正：
   - \`.agent/README.md\` 不存在
   - \`.agent/comment.md\`、\`.agent/naming.md\`、\`.agent/constant.md\`、\`.agent/api.md\` 如果存在，必须是软链接，不能是普通文件
   - \`.agent/vue.md\`、\`.agent/unocss.md\`、\`.agent/admin/*.md\`、\`.agent/tauri/rules.md\`、\`.agent/uni/rules.md\` 如果存在，必须是软链接，不能是普通文件
   - 如果误创建了上述普通文件，先删除，再重建为软链接
   - 如果因平台权限导致软链接创建失败，明确报出阻塞原因，不要复制文件替代
11. 仅在命中对应场景时按需扩读以下参考：
   - \`${skillReadmePath}\`
   - \`${projectAgentsPath}\`
   - \`${projectClaudePath}\`
   - \`${apiPath}\`
   - \`${commentPath}\`
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
12. 保持 Aimin 约束：命名简洁、避免过度封装、禁止无语义缩写、常见缩写补中文语义
13. 先检查真实代码仓库，再把 $ARGUMENTS 当成补充上下文

## 已安装参考

- 主入口：\`${skillEntryPath}\`
- 项目 AGENTS 模板：\`${projectAgentsPath}\`
- 项目 CLAUDE 模板：\`${projectClaudePath}\`
- 注释规范：\`${commentPath}\`
- 命名规范：\`${namingPath}\`
- 常量规范：\`${constantPath}\`
- 接口规范：\`${apiPath}\`
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
  const heading = getPromptHeading(options.surfaceType, command);
  const skillEntryPath = getReferencePath(referenceDir, 'SKILL.md');
  const apiPath = getReferencePath(referenceDir, 'api.md');
  const commentPath = getReferencePath(referenceDir, 'comment.md');
  const constantPath = getReferencePath(referenceDir, 'constant.md');
  const namingPath = getReferencePath(referenceDir, 'naming.md');
  const constantsIndexPath = getReferencePath(referenceDir, 'index', 'constants.json');
  const utilsIndexPath = getReferencePath(referenceDir, 'index', 'utils.json');

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
  const projectAgentsPath = getReferencePath(referenceDir, 'project', 'AGENTS.md');
  const projectClaudePath = getReferencePath(referenceDir, 'project', 'CLAUDE.md');
  const lintGuidePath = getReferencePath(referenceDir, 'project', 'scripts', 'lint.md');

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
 * 获取共享规则软链接策略说明
 * @param {'mac' | 'windows'} platform 安装平台
 * @returns {string}
 */
function getSharedRuleLinkStrategy(platform) {
  if (platform === 'windows') {
    return [
      '   - Windows: 使用 PowerShell 创建文件级 SymbolicLink，优先命令：`New-Item -ItemType SymbolicLink -Path <项目路径> -Target <参考路径> -Force`',
      '   - Windows: 创建前如果目标已存在，先用 `Remove-Item -Force` 删除已有文件或软链接，再创建新的 SymbolicLink',
      '   - Windows: 这里链接的大多是文件，不要用目录 Junction 代替文件软链接',
      '   - Windows: 如果因未开启 Developer Mode 或权限不足导致 SymbolicLink 创建失败，明确说明阻塞原因，不要静默复制文件替代'
    ].join('\n');
  }

  return [
    '   - macOS/Linux: 使用 `ln -sfn <参考路径> <项目路径>` 创建或刷新文件软链接',
    '   - macOS/Linux: 如果父目录不存在，先创建父目录，再执行 `ln -sfn`',
    '   - macOS/Linux: 如目标路径是普通文件且无法直接覆盖，先删除旧文件，再重新建立软链接'
  ].join('\n');
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
