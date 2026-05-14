import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { COMMAND_DEFINITIONS } from '../src/cli/constants.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const RULE_VERSION = '0.1.0';
const MARKDOWN_VERSION_MARKER = `<!-- aimin-skill-version: ${RULE_VERSION} -->`;
const GUIDE_RULE_VERSION = '0.1.3';
const GUIDE_RULE_VERSION_MARKER = `<!-- aimin-skill-version: ${GUIDE_RULE_VERSION} -->`;
const CORE_RULE_VERSION = '0.1.1';
const CORE_RULE_VERSION_MARKER = `<!-- aimin-skill-version: ${CORE_RULE_VERSION} -->`;
const AGENTS_TEMPLATE_VERSION = '0.1.3';
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

  const requirementContent = await readText(path.join(repoRoot, 'commands', 'requirement.md'));
  assertIncludes(requirementContent, '/am:requirement', 'requirement 命令说明缺少 /am:requirement');
  assertIncludes(requirementContent, '.agent/ui/{feature-name}/', 'requirement 命令说明缺少 .agent/ui 输出目录');
  assertIncludes(requirementContent, '需求分析.md', 'requirement 命令说明缺少需求分析文档');
  assertIncludes(requirementContent, '线框图.md', 'requirement 命令说明缺少线框文档');
  assertIncludes(requirementContent, '设计说明.md', 'requirement 命令说明缺少设计说明文档');
  assertIncludes(requirementContent, '开发说明.md', 'requirement 命令说明缺少开发说明文档');
  assertIncludes(requirementContent, '验收标准.md', 'requirement 命令说明缺少验收标准文档');
  assertIncludes(requirementContent, '不生成 Pencil 设计稿', 'requirement 命令说明缺少设计边界');

  const designContent = await readText(path.join(repoRoot, 'commands', 'design.md'));
  assertIncludes(designContent, '/am:design', 'design 命令说明缺少 /am:design');
  assertIncludes(designContent, '.agent/ui/{feature-name}/{design-source}/', 'design 命令说明缺少设计产物目录');
  assertIncludes(designContent, 'Pencil', 'design 命令说明缺少 Pencil 要求');
  assertIncludes(designContent, 'Remix Icon', 'design 命令说明缺少 Remix Icon 要求');
  assertIncludes(designContent, '需求分析.md', 'design 命令说明缺少需求文档输入');
  assertIncludes(designContent, '线框图.md', 'design 命令说明缺少线框文档输入');
  assertIncludes(designContent, '设计说明.md', 'design 命令说明缺少设计说明输入');
  assertIncludes(designContent, '验收标准.md', 'design 命令说明缺少验收标准输入');
  assertIncludes(designContent, '不要基于一句话想法直接跳过需求阶段', 'design 命令说明缺少需求阶段边界');

  const reviewContent = await readText(path.join(repoRoot, 'commands', 'review.md'));
  assertIncludes(reviewContent, '/am:review', 'review 命令说明缺少 /am:review');
  assertIncludes(reviewContent, '阿里风格', 'review 命令说明缺少阿里风格目标');
  assertIncludes(reviewContent, '默认只输出 review 结果', 'review 命令说明缺少默认只读行为');
  assertIncludes(reviewContent, 'Findings', 'review 命令说明缺少 Findings 输出格式');
  assertIncludes(reviewContent, '文件路径和行号', 'review 命令说明缺少定位要求');
  assertIncludes(reviewContent, '.agent/comment.md', 'review 命令说明缺少 comment 规则引用');
  assertIncludes(reviewContent, '.agent/naming.md', 'review 命令说明缺少 naming 规则引用');
  assertIncludes(reviewContent, '.agent/api.md', 'review 命令说明缺少 api 规则引用');

  const archiveContent = await readText(path.join(repoRoot, 'commands', 'archive.md'));
  assertIncludes(archiveContent, '/am:archive', 'archive 命令说明缺少 /am:archive');
  assertIncludes(archiveContent, '.agent/archive/', 'archive 命令说明缺少 .agent/archive 输出目录');
  assertIncludes(archiveContent, '.agent/docs/', 'archive 命令说明缺少 .agent/docs 原始资料说明');
  assertIncludes(archiveContent, '.agent/archive/README.md', 'archive 命令说明缺少 archive 索引要求');
  assertIncludes(archiveContent, 'AGENTS.md', 'archive 命令说明缺少 AGENTS.md 维护要求');
  assertIncludes(archiveContent, '项目级别规则', 'archive 命令说明缺少项目级规则表');
  assertIncludes(archiveContent, '修改范围 / 对应归档文档 / 读取要求 / 备注', 'archive 命令说明缺少项目级规则表头');
  assertIncludes(archiveContent, '只整理关键点', 'archive 命令说明缺少关键点要求');
  assertIncludes(archiveContent, '功能点和页面', 'archive 命令说明缺少功能点和页面分类');
  assertIncludes(archiveContent, '文件落点', 'archive 命令说明缺少文件落点规则');
  assertIncludes(archiveContent, '已有对应归档文件', 'archive 命令说明缺少更新对应文件规则');
  assertIncludes(archiveContent, '稳定主题', 'archive 命令说明缺少稳定主题新建规则');
  assertExcludes(archiveContent, 'YYYY-MM-DD-{topic}.md', 'archive 命令说明不应使用日期文件名模板');
  assertIncludes(archiveContent, 'Markdown 表格', 'archive 命令说明缺少表格化要求');
  assertIncludes(archiveContent, '必须先读取相关归档文档', 'archive 命令说明缺少预读要求');
  assertIncludes(archiveContent, '用户 prompt', 'archive 命令说明缺少 prompt 确认要求');
  assertIncludes(archiveContent, '回写到对应归档文档', 'archive 命令说明缺少修改后回写要求');
  assertExcludes(archiveContent, '.agent/archive/features/', 'archive 命令说明不应再使用 features 子目录');
  assertExcludes(archiveContent, '.agent/archive/pages/', 'archive 命令说明不应再使用 pages 子目录');
  assertExcludes(archiveContent, '.agent/archive/sessions/', 'archive 命令说明不应再使用 sessions 子目录');

  const updateContent = await readText(path.join(repoRoot, 'commands', 'update.md'));
  assertIncludes(updateContent, '/am:update', 'update 命令说明缺少 /am:update');
  assertIncludes(updateContent, '.agent/api.md', 'update 命令说明缺少 api 规则升级目标');
  assertIncludes(updateContent, '.agent/comment.md', 'update 命令说明缺少 comment 规则升级目标');
  assertIncludes(updateContent, '.agent/naming.md', 'update 命令说明缺少 naming 规则升级目标');
  assertIncludes(updateContent, '强制覆盖', 'update 命令说明缺少强制覆盖要求');
  assertIncludes(updateContent, '只更新 `# Aimin-skill`', 'update 命令说明缺少 AGENTS 受管段落要求');
  assertIncludes(updateContent, '不更新 `CLAUDE.md`', 'update 命令说明不应更新 CLAUDE.md');
  assertIncludes(updateContent, '版本号与参考文件不一致', 'update 命令说明缺少版本比较要求');

  const sessionContent = await readText(path.join(repoRoot, 'commands', 'session.md'));
  assertIncludes(sessionContent, '/am:session', 'session 命令说明缺少 /am:session');
  assertIncludes(sessionContent, '.agents/archive/sessions/', 'session 命令说明缺少 archive 会话输出目录');
  assertIncludes(sessionContent, '.agents/archive/README.md', 'session 命令说明缺少 archive 索引要求');
  assertIncludes(sessionContent, '当前会话', 'session 命令说明缺少当前会话来源');
  assertIncludes(sessionContent, '不要覆盖', 'session 命令说明缺少防覆盖要求');
  assertIncludes(sessionContent, '不要修改 `AGENTS.md`', 'session 命令说明缺少边界要求');
  assertIncludes(sessionContent, 'Markdown 表格', 'session 命令说明缺少表格化归档要求');
}

async function validateProjectTemplates() {
  const skillEntryContent = await readText(path.join(repoRoot, 'skills', 'SKILL.md'));
  const agentsContent = await readText(path.join(repoRoot, 'skills', 'template', 'AGENTS.md'));
  const claudeContent = await readText(path.join(repoRoot, 'skills', 'template', 'CLAUDE.md'));
  const skillReadmeContent = await readText(path.join(repoRoot, 'skills', 'README.md'));
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
    assertIncludes(content, '### 项目级别规则', '渐进式模板缺少项目级别规则章节');
    assertIncludes(content, '修改范围 | 对应归档文档 | 读取要求 | 备注', '渐进式模板缺少项目级规则表');
    assertIncludes(content, '修改某个功能点、页面或模块前', '渐进式模板缺少归档预读要求');
  }

  assertIncludes(skillEntryContent, GUIDE_RULE_VERSION_MARKER, 'skill 入口缺少版本号');
  assertIncludes(skillEntryContent, 'am:requirement', 'skill 入口缺少 requirement 命令说明');
  assertIncludes(skillEntryContent, 'am:design', 'skill 入口缺少 design 命令说明');
  assertIncludes(skillEntryContent, 'am:archive', 'skill 入口缺少 archive 命令说明');
  assertIncludes(skillEntryContent, '.agent/ui/{feature-name}/', 'skill 入口缺少 .agent/ui 需求目录说明');
  assertIncludes(skillReadmeContent, 'comment.md', 'README 缺少 comment 规则说明');
  assertIncludes(skillReadmeContent, GUIDE_RULE_VERSION_MARKER, 'README 缺少版本号');
  assertIncludes(skillReadmeContent, '/am:requirement', 'README 缺少 requirement 命令说明');
  assertIncludes(skillReadmeContent, '/am:design', 'README 缺少 design 命令说明');
  assertIncludes(skillReadmeContent, '/am:archive', 'README 缺少 archive 命令说明');
  assertIncludes(skillReadmeContent, '项目级规则表', 'README 缺少项目级规则表说明');
  assertIncludes(skillReadmeContent, '/am:review', 'README 缺少 review 命令说明');
  assertIncludes(skillReadmeContent, '/am:session', 'README 缺少 session 命令说明');
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
    'skills/SKILL.md',
    'skills/README.md',
    'skills/api.md',
    'skills/comment.md',
    'skills/constant.md',
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
    const versionMarker = getMarkdownVersionMarker(relativePath);
    assertIncludes(content, versionMarker, `${relativePath} 缺少版本号`);
  }
}

function getMarkdownVersionMarker(relativePath) {
  if (['skills/SKILL.md', 'skills/README.md'].includes(relativePath))
    return GUIDE_RULE_VERSION_MARKER;

  if (relativePath === 'skills/template/AGENTS.md')
    return AGENTS_TEMPLATE_VERSION_MARKER;

  if (['skills/api.md', 'skills/comment.md', 'skills/constant.md', 'skills/naming.md'].includes(relativePath))
    return CORE_RULE_VERSION_MARKER;

  return MARKDOWN_VERSION_MARKER;
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
