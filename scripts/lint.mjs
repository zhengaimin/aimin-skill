import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { COMMAND_DEFINITIONS } from '../src/cli/constants.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

await validateCommandGuides();
await validateProjectTemplates();
await validateJsonFiles();

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
  assertIncludes(initContent, 'AGENTS.md', 'init 命令说明缺少 AGENTS.md');
  assertIncludes(initContent, 'CLAUDE.md', 'init 命令说明缺少 CLAUDE.md');
  assertIncludes(initContent, '.agent/index/constants.json', 'init 命令说明缺少 constants 索引');
  assertIncludes(initContent, '.agent/index/utils.json', 'init 命令说明缺少 utils 索引');
  assertIncludes(initContent, '.agent/comment.md', 'init 命令说明缺少 comment 路由');
  assertIncludes(initContent, '.agent/scripts/lint.md', 'init 命令说明缺少 lint 路由');
  assertIncludes(initContent, '对本次修改文件执行 lint 校验', 'init 命令说明缺少改动文件 lint 要求');
  assertIncludes(initContent, '/am:init', 'init 命令说明缺少 /am:init');
  assertIncludes(initContent, '非 admin 项目，不要把 admin 专属检查写进 `.agent/scripts/lint.md`', 'init 命令说明缺少非 admin 限制');
  assertIncludes(initContent, 'prettier/prettier', 'init 命令说明缺少 CRLF / prettier 提示');

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
}

async function validateProjectTemplates() {
  const agentsContent = await readText(path.join(repoRoot, 'skills', 'project', 'AGENTS.md'));
  const claudeContent = await readText(path.join(repoRoot, 'skills', 'project', 'CLAUDE.md'));
  const projectReadmeContent = await readText(path.join(repoRoot, 'skills', 'project', 'README.md'));
  const lintContent = await readText(path.join(repoRoot, 'skills', 'project', 'scripts', 'lint.md'));

  for (const content of [agentsContent, claudeContent]) {
    assertIncludes(content, '.agent/api.md', '渐进式模板缺少 api 路由');
    assertIncludes(content, '.agent/index/constants.json', '渐进式模板缺少 constants 路由');
    assertIncludes(content, '.agent/index/utils.json', '渐进式模板缺少 utils 路由');
    assertIncludes(content, '.agent/comment.md', '渐进式模板缺少 comment 路由');
    assertIncludes(content, '.agent/scripts/lint.md', '渐进式模板缺少 lint 路由');
    assertIncludes(content, '对本次修改文件做校验', '渐进式模板缺少改动文件 lint 要求');
  }

  assertIncludes(projectReadmeContent, '.agent/comment.md', 'README 模板缺少 comment 路由');
  assertIncludes(projectReadmeContent, '├── comment.md', 'README 模板缺少 comment 目录结构');
  assertIncludes(lintContent, '.agent/comment.md', 'lint 模板缺少 comment 引用');
  assertIncludes(lintContent, '.agent/naming.md', 'lint 模板缺少 naming 引用');
  assertIncludes(lintContent, '对本次修改文件执行 lint 校验', 'lint 模板缺少改动文件 lint 要求');
  assertExcludes(lintContent, 'admin 额外检查', 'lint 模板不应默认包含 admin 额外检查');
  assertExcludes(lintContent, '未使用变量', 'lint 模板不应默认包含 admin 未使用变量检查');
}

async function validateJsonFiles() {
  await readJson(path.join(repoRoot, 'skills', 'index', 'constants.json'));
  await readJson(path.join(repoRoot, 'skills', 'index', 'utils.json'));
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
