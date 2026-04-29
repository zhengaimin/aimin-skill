import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { COMMAND_DEFINITIONS } from '../src/cli/constants.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const RULE_VERSION = '0.1.0';
const MARKDOWN_VERSION_MARKER = `<!-- aimin-skill-version: ${RULE_VERSION} -->`;
const AGENTS_TEMPLATE_VERSION = '0.1.2';
const AGENTS_TEMPLATE_VERSION_MARKER = `<!-- aimin-skill-version: ${AGENTS_TEMPLATE_VERSION} -->`;

await validateCommandGuides();
await validateProjectTemplates();
await validateJsonFiles();
await validateRepoAgents();

if (errors.length > 0) {
  for (const error of errors)
    console.error(`lint error: ${error}`);

  process.exitCode = 1;
} else {
  console.log('lint ok');
}

async function validateCommandGuides() {
  for (const command of COMMAND_DEFINITIONS) {
    const guidePath = path.join(repoRoot, 'commands', `${command.key}.md`);
    await readText(guidePath);
  }

  const initContent = await readText(path.join(repoRoot, 'commands', 'init.md'));
  assertIncludes(initContent, '固定初始化项目根目录 `AGENTS.md`、`CLAUDE.md` 与项目侧 `.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md`', 'init 命令说明缺少固定初始化目标');
  assertIncludes(initContent, 'AGENTS.md', 'init 命令说明缺少 AGENTS.md');
  assertIncludes(initContent, 'CLAUDE.md', 'init 命令说明缺少 CLAUDE.md');
  assertIncludes(initContent, '.agent/api.md', 'init 命令说明缺少 api 规则');
  assertIncludes(initContent, '.agent/comment.md', 'init 命令说明缺少 comment 规则');
  assertIncludes(initContent, '.agent/naming.md', 'init 命令说明缺少 naming 规则');
  assertIncludes(initContent, '.agent/index/constants.json', 'init 命令说明缺少 constants 索引');
  assertIncludes(initContent, '.agent/index/utils.json', 'init 命令说明缺少 utils 索引');
  assertIncludes(initContent, '.agent/scripts/lint.md', 'init 命令说明缺少 lint 路由');
  assertIncludes(initContent, '.agent/admin/rules.md', 'init 命令说明缺少 admin 目录说明');
  assertIncludes(initContent, '.agent/tauri/rules.md', 'init 命令说明缺少 tauri 目录说明');
  assertIncludes(initContent, '.agent/uni/rules.md', 'init 命令说明缺少 uni 目录说明');
  assertIncludes(initContent, '最多选择一组', 'init 命令说明缺少技术栈目录选择约束');
  assertIncludes(initContent, '不要创建或修改根目录 `.gitignore`', 'init 命令说明缺少 .gitignore 限制');
  assertIncludes(initContent, '以参考模板为基线创建或更新', 'init 命令说明缺少根文档模板基线要求');
  assertIncludes(initContent, '只更新 `# Aimin-skill`', 'init 命令说明缺少根文档受管段落要求');
  assertIncludes(initContent, '如果需要添加项目自己的规则', 'init 命令说明缺少项目独有内容追加约束');
  assertIncludes(initContent, '不要把模板整体改写成另一份文档', 'init 命令说明缺少禁止整份改写模板约束');
  assertIncludes(initContent, '版本号与参考文件不一致', 'init 命令说明缺少版本不一致判断');
  assertIncludes(initContent, '强制更新', 'init 命令说明缺少版本不一致强制更新要求');
  assertIncludes(initContent, '对本次修改文件执行 lint 校验', 'init 命令说明缺少改动文件 lint 要求');
  assertIncludes(initContent, '/am:init', 'init 命令说明缺少 /am:init');
  assertExcludes(initContent, '软链接', 'init 命令说明不应再包含软链接策略');
  assertExcludes(initContent, 'prettier/prettier', 'init 命令说明不应包含 admin 专属 prettier 提示');

  const apiContent = await readText(path.join(repoRoot, 'commands', 'api.md'));
  assertIncludes(apiContent, '/am:api', 'api 命令说明缺少 /am:api');

  const planContent = await readText(path.join(repoRoot, 'commands', 'plan.md'));
  assertIncludes(planContent, '/am:plan', 'plan 命令说明缺少 /am:plan');
  assertIncludes(planContent, '手动触发', 'plan 命令说明缺少手动触发表述');
  assertIncludes(planContent, '对本次修改文件执行 lint 校验', 'plan 命令说明缺少改动文件 lint 要求');
  assertExcludes(planContent, 'git', 'plan 命令说明不应包含 git 内容');
  assertExcludes(planContent, '远端', 'plan 命令说明不应包含远端同步内容');
  assertExcludes(planContent, '分支', 'plan 命令说明不应包含分支内容');
  assertExcludes(planContent, '冲突', 'plan 命令说明不应包含冲突处理内容');
  assertIncludes(planContent, '调研', 'plan 命令说明缺少调研阶段');
  assertIncludes(planContent, '拆任务', 'plan 命令说明缺少拆任务阶段');
  assertIncludes(planContent, '实施', 'plan 命令说明缺少实施阶段');
  assertIncludes(planContent, '自检', 'plan 命令说明缺少自检阶段');
  assertIncludes(planContent, '交付', 'plan 命令说明缺少交付阶段');
  assertIncludes(planContent, '.agent/scripts/lint.md', 'plan 命令说明缺少 lint 收尾');

  const updateContent = await readText(path.join(repoRoot, 'commands', 'update.md'));
  assertIncludes(updateContent, '/am:update', 'update 命令说明缺少 /am:update');
  assertIncludes(updateContent, '.agent/api.md', 'update 命令说明缺少 api 规则升级目标');
  assertIncludes(updateContent, '.agent/comment.md', 'update 命令说明缺少 comment 规则升级目标');
  assertIncludes(updateContent, '.agent/naming.md', 'update 命令说明缺少 naming 规则升级目标');
  assertIncludes(updateContent, '强制覆盖', 'update 命令说明缺少强制覆盖要求');
  assertIncludes(updateContent, '只更新 `# Aimin-skill`', 'update 命令说明缺少 AGENTS 受管段落要求');
  assertIncludes(updateContent, '不更新 `CLAUDE.md`', 'update 命令说明不应更新 CLAUDE.md');
  assertIncludes(updateContent, '版本号与参考文件不一致', 'update 命令说明缺少版本比较要求');
}

async function validateProjectTemplates() {
  const agentsContent = await readText(path.join(repoRoot, 'skills', 'template', 'AGENTS.md'));
  const claudeContent = await readText(path.join(repoRoot, 'skills', 'template', 'CLAUDE.md'));
  const lintContent = await readText(path.join(repoRoot, 'skills', 'template', 'scripts', 'lint.md'));

  for (const content of [agentsContent, claudeContent]) {
    assertIncludes(content, AGENTS_TEMPLATE_VERSION_MARKER, '渐进式模板缺少版本号');
    assertIncludes(content, '.agent/api.md', '渐进式模板缺少 api 路由');
    assertIncludes(content, '.agent/index/constants.json', '渐进式模板缺少 constants 路由');
    assertIncludes(content, '.agent/index/utils.json', '渐进式模板缺少 utils 路由');
    assertIncludes(content, '.agent/comment.md', '渐进式模板缺少 comment 路由');
    assertIncludes(content, '.agent/naming.md', '渐进式模板缺少 naming 路由');
    assertIncludes(content, '.agent/scripts/lint.md', '渐进式模板缺少 lint 路由');
    assertIncludes(content, '按 `.agent/scripts/lint.md` 对本次修改文件执行 lint', '渐进式模板缺少改动文件 lint 要求');
    assertIncludes(content, '### 代码注释', '渐进式模板缺少代码注释章节');
    assertIncludes(content, '新增或修改代码时，同步检查注释是否需要补充、调整或删除', '渐进式模板缺少注释检查要求');
    assertIncludes(content, '具体范围、格式和边界以 `.agent/comment.md` 为准', '渐进式模板缺少 comment 规则引用');
  }

  assertIncludes(lintContent, '.agent/index/constants.json', 'lint 模板缺少 constants 索引引用');
  assertIncludes(lintContent, '.agent/index/utils.json', 'lint 模板缺少 utils 索引引用');
  assertIncludes(lintContent, MARKDOWN_VERSION_MARKER, 'lint 模板缺少版本号');
  assertIncludes(lintContent, '对本次修改文件执行 lint 校验', 'lint 模板缺少改动文件 lint 要求');
  assertExcludes(lintContent, '.agent/comment.md', 'lint 模板不应依赖 comment 规则');
  assertExcludes(lintContent, '.agent/naming.md', 'lint 模板不应依赖 naming 规则');
  assertExcludes(lintContent, 'admin 额外检查', 'lint 模板不应默认包含 admin 额外检查');
  assertExcludes(lintContent, '未使用变量', 'lint 模板不应默认包含 admin 未使用变量检查');
}

async function validateJsonFiles() {
  await assertJsonVersion(path.join(repoRoot, 'skills', 'template', 'index', 'constants.json'));
  await assertJsonVersion(path.join(repoRoot, 'skills', 'template', 'index', 'utils.json'));
  await validateMarkdownVersions();
}

async function validateMarkdownVersions() {
  const relativePaths = [
    'skills/api.md',
    'skills/comment.md',
    'skills/naming.md',
    'skills/template/AGENTS.md',
    'skills/template/scripts/lint.md',
    'skills/template/admin/rules.md',
    'skills/template/admin/table.md',
    'skills/template/admin/modal.md',
    'skills/template/tauri/rules.md',
    'skills/template/uni/rules.md'
  ];

  for (const relativePath of relativePaths) {
    const content = await readText(path.join(repoRoot, relativePath));
    const versionMarker = relativePath === 'skills/template/AGENTS.md'
      ? AGENTS_TEMPLATE_VERSION_MARKER
      : MARKDOWN_VERSION_MARKER;
    assertIncludes(content, versionMarker, `${relativePath} 缺少版本号`);
  }
}

async function validateRepoAgents() {
  const agentsContent = await readText(path.join(repoRoot, 'AGENTS.md'));

  assertIncludes(agentsContent, '修改 `skills/**/*.md` 时，必须同步更新该文件对应的版本号', '根 AGENTS 缺少 skills md 版本维护规则');
}

async function assertJsonVersion(filePath) {
  const data = await readJson(filePath);

  if (data && data.version !== RULE_VERSION)
    errors.push(`JSON 版本号不正确: ${filePath}`);
}

async function readText(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    errors.push(`缺少文件: ${filePath}`);
    return '';
  }
}

async function readJson(filePath) {
  const content = await readText(filePath);

  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch {
    errors.push(`JSON 解析失败: ${filePath}`);
    return null;
  }
}

function assertIncludes(content, keyword, message) {
  if (!content.includes(keyword))
    errors.push(message);
}

function assertExcludes(content, keyword, message) {
  if (content.includes(keyword))
    errors.push(message);
}
