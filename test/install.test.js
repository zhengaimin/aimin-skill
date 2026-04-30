/**
 * aimin-skill 安装器测试
 * 校验本地 marketplace/plugin 生成、重复执行与 force 重建行为
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createDoctorReport } from '../src/cli/doctor.js';
import { initUserInstall } from '../src/cli/install/index.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * 创建临时 home 目录
 * @returns {Promise<string>}
 */
async function createTempHomeDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'aimin-skill-'));
}

/**
 * 构造测试环境变量
 * @param {string} homeDir 临时 home 目录
 * @returns {Promise<NodeJS.ProcessEnv>}
 */
async function createMockToolEnv(homeDir, options = {}) {
  const {
    claudeRemoveShouldFailMissing = false,
    claudeUpdateShouldFail = false,
    failIfDebuggerEnvPresent = false
  } = options;
  const binDir = path.join(homeDir, 'bin');
  const isWindows = process.platform === 'win32';
  const claudePath = path.join(binDir, isWindows ? 'claude.cmd' : 'claude');
  const codexPath = path.join(binDir, isWindows ? 'codex.cmd' : 'codex');

  await fs.mkdir(binDir, { recursive: true });

  if (isWindows) {
    await fs.writeFile(claudePath, `@echo off
${failIfDebuggerEnvPresent ? 'if defined NODE_OPTIONS exit /b 1\r\nif defined NODE_INSPECT_RESUME_ON_START exit /b 1\r\nif defined VSCODE_INSPECTOR_OPTIONS exit /b 1\r\n' : ''}
if "%1"=="plugin" if "%2"=="marketplace" if "%3"=="add" (
  node -e "const fs=require('fs'); const path=require('path'); const home=process.env.HOME; const source=process.argv[1]; fs.mkdirSync(path.join(home,'.claude','plugins'),{recursive:true}); const data={'aimin-skill':{source:{source:'local',path:source},installLocation:path.join(home,'.claude','plugins','marketplaces','aimin-skill'),lastUpdated:'2026-04-22T00:00:00.000Z'}}; fs.writeFileSync(path.join(home,'.claude','plugins','known_marketplaces.json'), JSON.stringify(data, null, 2));" "%4"
  exit /b 0
)

if "%1"=="plugin" if "%2"=="marketplace" if "%3"=="update" (
  ${claudeUpdateShouldFail ? 'echo mock claude update failed 1>&2\r\n  exit /b 1' : 'exit /b 0'}
)

if "%1"=="plugin" if "%2"=="marketplace" if "%3"=="remove" (
  ${claudeRemoveShouldFailMissing ? 'echo Marketplace \'aimin-skill\' not found 1>&2\r\n  exit /b 1' : ''}
  node -e "const fs=require('fs'); const path=require('path'); const home=process.env.HOME; fs.mkdirSync(path.join(home,'.claude','plugins'),{recursive:true}); fs.writeFileSync(path.join(home,'.claude','plugins','known_marketplaces.json'), '{}\\n');"
  exit /b 0
)

if "%1"=="plugin" if "%2"=="install" (
  node -e "const fs=require('fs'); const path=require('path'); const home=process.env.HOME; fs.mkdirSync(path.join(home,'.claude','plugins'),{recursive:true}); const data={version:2,plugins:{'am@aimin-skill':[{'scope':'user','installPath':path.join(home,'.claude','plugins','cache','aimin-skill','am','0.1.0'),'version':'0.1.0','installedAt':'2026-04-22T00:00:00.000Z','lastUpdated':'2026-04-22T00:00:00.000Z'}]}}; fs.writeFileSync(path.join(home,'.claude','plugins','installed_plugins.json'), JSON.stringify(data, null, 2));"
  exit /b 0
)

exit /b 0
`, 'utf8');

    await fs.writeFile(codexPath, `@echo off
${failIfDebuggerEnvPresent ? 'if defined NODE_OPTIONS exit /b 1\r\nif defined NODE_INSPECT_RESUME_ON_START exit /b 1\r\nif defined VSCODE_INSPECTOR_OPTIONS exit /b 1\r\n' : ''}
if "%1"=="plugin" if "%2"=="marketplace" if "%3"=="add" (
  node -e "const fs=require('fs'); const path=require('path'); const home=process.env.HOME; const source=process.argv[1]; fs.mkdirSync(path.join(home,'.codex'),{recursive:true}); const content='[marketplaces.aimin-skill]\\nlast_updated = \\"2026-04-22T00:00:00Z\\"\\nsource_type = \\"local\\"\\nsource = ' + JSON.stringify(source) + '\\n'; fs.writeFileSync(path.join(home,'.codex','config.toml'), content);" "%4"
  exit /b 0
)

if "%1"=="plugin" if "%2"=="marketplace" if "%3"=="remove" (
  node -e "const fs=require('fs'); const path=require('path'); const home=process.env.HOME; fs.mkdirSync(path.join(home,'.codex'),{recursive:true}); fs.writeFileSync(path.join(home,'.codex','config.toml'), '');"
  exit /b 0
)

if "%1"=="plugin" if "%2"=="marketplace" if "%3"=="upgrade" (
  echo Error: marketplace \`aimin-skill\` is not configured as a Git marketplace 1>&2
  exit /b 1
)

exit /b 0
`, 'utf8');
  } else {
    await fs.writeFile(claudePath, `#!/bin/sh
set -eu
${failIfDebuggerEnvPresent ? '\nif [ -n "${NODE_OPTIONS:-}" ] || [ -n "${NODE_INSPECT_RESUME_ON_START:-}" ] || [ -n "${VSCODE_INSPECTOR_OPTIONS:-}" ]; then\n  exit 1\nfi\n' : ''}
mkdir -p "$HOME/.claude/plugins"

if [ "$1" = "plugin" ] && [ "$2" = "marketplace" ] && [ "$3" = "add" ]; then
  source_path="$4"
  cat > "$HOME/.claude/plugins/known_marketplaces.json" <<EOF
{
  "aimin-skill": {
    "source": {
      "source": "local",
      "path": "$source_path"
    },
    "installLocation": "$HOME/.claude/plugins/marketplaces/aimin-skill",
    "lastUpdated": "2026-04-22T00:00:00.000Z"
  }
}
EOF
  exit 0
fi

if [ "$1" = "plugin" ] && [ "$2" = "marketplace" ] && [ "$3" = "update" ]; then
  ${claudeUpdateShouldFail ? 'echo "mock claude update failed" >&2\n  exit 1' : 'exit 0'}
fi

if [ "$1" = "plugin" ] && [ "$2" = "marketplace" ] && [ "$3" = "remove" ]; then
  ${claudeRemoveShouldFailMissing ? 'echo "Marketplace \'aimin-skill\' not found" >&2\n  exit 1' : ''}
  cat > "$HOME/.claude/plugins/known_marketplaces.json" <<EOF
{}
EOF
  exit 0
fi

if [ "$1" = "plugin" ] && [ "$2" = "install" ]; then
  cat > "$HOME/.claude/plugins/installed_plugins.json" <<EOF
{
  "version": 2,
  "plugins": {
    "am@aimin-skill": [
      {
        "scope": "user",
        "installPath": "$HOME/.claude/plugins/cache/aimin-skill/am/0.1.0",
        "version": "0.1.0",
        "installedAt": "2026-04-22T00:00:00.000Z",
        "lastUpdated": "2026-04-22T00:00:00.000Z"
      }
    ]
  }
}
EOF
  exit 0
fi

exit 0
`, 'utf8');

    await fs.writeFile(codexPath, `#!/bin/sh
set -eu
${failIfDebuggerEnvPresent ? '\nif [ -n "${NODE_OPTIONS:-}" ] || [ -n "${NODE_INSPECT_RESUME_ON_START:-}" ] || [ -n "${VSCODE_INSPECTOR_OPTIONS:-}" ]; then\n  exit 1\nfi\n' : ''}
mkdir -p "$HOME/.codex"

if [ "$1" = "plugin" ] && [ "$2" = "marketplace" ] && [ "$3" = "add" ]; then
  source_path="$4"
  cat > "$HOME/.codex/config.toml" <<EOF
[marketplaces.aimin-skill]
last_updated = "2026-04-22T00:00:00Z"
source_type = "local"
source = "$source_path"
EOF
  exit 0
fi

if [ "$1" = "plugin" ] && [ "$2" = "marketplace" ] && [ "$3" = "upgrade" ]; then
  echo "Error: marketplace \`aimin-skill\` is not configured as a Git marketplace" >&2
  exit 1
fi

exit 0
`, 'utf8');
  }

  if (!isWindows) {
    await fs.chmod(claudePath, 0o755);
    await fs.chmod(codexPath, 0o755);
  }

  return {
    ...process.env,
    HOME: homeDir,
    PATH: `${binDir}${path.delimiter}${process.env.PATH ?? ''}`
  };
}

/**
 * 读取目标文件内容
 * @param {string} homeDir 临时 home 目录
 * @param {string} relativePath 相对路径
 * @returns {Promise<string>}
 */
async function readInstalledFile(homeDir, relativePath) {
  return fs.readFile(path.join(homeDir, relativePath), 'utf8');
}

test('init installs local marketplace bundle and registers both tools', async () => {
  const homeDir = await createTempHomeDir();
  const env = await createMockToolEnv(homeDir);
  await initUserInstall({ env, homeDir, repoRoot });

  const initCommand = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/commands/init.md'
  );
  const updateCommand = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/commands/update.md'
  );
  const planSkill = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/skills/plan/SKILL.md'
  );
  const sessionCommand = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/commands/session.md'
  );
  const sessionSkill = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/skills/session/SKILL.md'
  );
  const codexRouterSkill = await readInstalledFile(
    homeDir,
    '.codex/skills/am/SKILL.md'
  );
  const codexInitSkill = await readInstalledFile(
    homeDir,
    '.codex/skills/am-init/SKILL.md'
  );
  const codexUpdateSkill = await readInstalledFile(
    homeDir,
    '.codex/skills/am-update/SKILL.md'
  );
  const codexSessionSkill = await readInstalledFile(
    homeDir,
    '.codex/skills/am-session/SKILL.md'
  );
  const projectAgentsTemplate = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/template/AGENTS.md'
  );
  const projectClaudeTemplate = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/template/CLAUDE.md'
  );
  const projectLintTemplate = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/template/scripts/lint.md'
  );
  const apiRule = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/api.md'
  );
  const commentRule = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/comment.md'
  );
  const namingRule = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/naming.md'
  );
  const constantsIndexTemplate = JSON.parse(
    await readInstalledFile(
      homeDir,
      '.aimin-skill-marketplace/plugins/am/references/template/index/constants.json'
    )
  );
  const utilsIndexTemplate = JSON.parse(
    await readInstalledFile(
      homeDir,
      '.aimin-skill-marketplace/plugins/am/references/template/index/utils.json'
    )
  );
  const manifest = JSON.parse(
    await readInstalledFile(homeDir, '.aimin-skill-marketplace/.aimin-skill-manifest.json')
  );
  const claudeInstalled = JSON.parse(
    await readInstalledFile(homeDir, '.claude/plugins/installed_plugins.json')
  );
  const codexConfig = await readInstalledFile(homeDir, '.codex/config.toml');

  assert.match(initCommand, /Managed by aimin-skill/);
  assert.match(initCommand, /^# \/am:init$/m);
  assert.match(initCommand, /\/am:init/);
  assert.match(initCommand, /## 执行要求/);
  assert.match(initCommand, /固定创建或更新这些项目文件/);
  assert.match(initCommand, /`AGENTS\.md`/);
  assert.match(initCommand, /`CLAUDE\.md`/);
  assert.match(initCommand, /\.agent\/api\.md/);
  assert.match(initCommand, /\.agent\/comment\.md/);
  assert.match(initCommand, /\.agent\/naming\.md/);
  assert.match(initCommand, /不要创建或修改根目录 `\.gitignore`/);
  assert.match(initCommand, /`AGENTS\.md` 与 `CLAUDE\.md` 以参考模板为基线创建或更新/);
  assert.match(initCommand, /只更新 `# Aimin-skill`/);
  assert.match(initCommand, /版本号与参考文件不一致/);
  assert.match(initCommand, /强制更新/);
  assert.match(initCommand, /`skills\/template\/` 是初始化模板目录/);
  assert.match(initCommand, /如果需要添加项目自己的规则/);
  assert.match(initCommand, /不要把模板整体改写成另一份文档/);
  assert.match(initCommand, /\.agent\/README\.md` 不存在/);
  assert.match(initCommand, /\.agent\/index\/constants\.json/);
  assert.match(initCommand, /\.agent\/index\/utils\.json/);
  assert.match(initCommand, /\.agent\/admin\/rules\.md/);
  assert.match(initCommand, /\.agent\/tauri\/rules\.md/);
  assert.match(initCommand, /\.agent\/uni\/rules\.md/);
  assert.match(initCommand, /最多选择一组/);
  assert.doesNotMatch(initCommand, /也不要创建 `\.agent\/comment\.md`/);
  assert.doesNotMatch(initCommand, /也不要创建 `\.agent\/naming\.md`/);
  assert.doesNotMatch(initCommand, /也不要创建 `\.agent\/api\.md`/);
  assert.doesNotMatch(initCommand, /软链接/);
  assert.doesNotMatch(initCommand, /ln -sfn/);
  assert.doesNotMatch(initCommand, /The user invoked this command/);
  assert.doesNotMatch(initCommand, /项目 README 模板/);
  assert.match(updateCommand, /Managed by aimin-skill/);
  assert.match(updateCommand, /^# \/am:update$/m);
  assert.match(updateCommand, /\.agent\/api\.md/);
  assert.match(updateCommand, /\.agent\/comment\.md/);
  assert.match(updateCommand, /\.agent\/naming\.md/);
  assert.match(updateCommand, /强制覆盖/);
  assert.match(updateCommand, /只更新 `# Aimin-skill`/);
  assert.match(updateCommand, /不更新 `CLAUDE\.md`/);
  assert.match(planSkill, /name: plan/);
  assert.match(planSkill, /调研/);
  assert.doesNotMatch(planSkill, /(git|远端|分支|冲突)/);
  assert.match(sessionCommand, /^# \/am:session$/m);
  assert.match(sessionCommand, /\.agent\/docs/);
  assert.match(sessionCommand, /不要覆盖/);
  assert.match(sessionCommand, /Markdown 表格/);
  assert.match(sessionSkill, /name: session/);
  assert.match(sessionSkill, /会话主题、背景与目标、已确认信息/);
  assert.match(sessionSkill, /Markdown 表格/);
  assert.match(codexRouterSkill, /name: am/);
  assert.match(codexRouterSkill, /\$am-init/);
  assert.match(codexRouterSkill, /\$am-update/);
  assert.match(codexRouterSkill, /\$am-session/);
  assert.match(codexInitSkill, /name: am-init/);
  assert.match(codexInitSkill, /用户通过 `\$am-init` 主动调用本 skill/);
  assert.match(codexUpdateSkill, /name: am-update/);
  assert.match(codexUpdateSkill, /用户通过 `\$am-update` 主动调用本 skill/);
  assert.match(codexSessionSkill, /name: am-session/);
  assert.match(codexSessionSkill, /用户通过 `\$am-session` 主动调用本 skill/);
  assert.match(codexSessionSkill, /Markdown 表格/);
  assert.match(projectAgentsTemplate, /^# Aimin-skill$/m);
  assert.match(projectAgentsTemplate, /<!-- aimin-skill-version: 0\.1\.2 -->/);
  assert.match(projectAgentsTemplate, /\.agent\/api\.md/);
  assert.match(projectAgentsTemplate, /\.agent\/comment\.md/);
  assert.match(projectAgentsTemplate, /\.agent\/naming\.md/);
  assert.match(projectAgentsTemplate, /\.agent\/index\/constants\.json/);
  assert.match(projectAgentsTemplate, /\.agent\/index\/utils\.json/);
  assert.match(projectAgentsTemplate, /\.agent\/scripts\/lint\.md/);
  assert.match(projectAgentsTemplate, /### 读取规则/);
  assert.match(projectAgentsTemplate, /### 修改边界/);
  assert.match(projectAgentsTemplate, /### 代码注释/);
  assert.match(projectAgentsTemplate, /新增或修改代码时，同步检查注释是否需要补充、调整或删除/);
  assert.match(projectAgentsTemplate, /具体范围、格式和边界以 `\.agent\/comment\.md` 为准/);
  assert.doesNotMatch(projectAgentsTemplate, /新增或修改代码必须补充必要中文注释/);
  assert.doesNotMatch(projectAgentsTemplate, /变量、计算属性定义使用中文 `\/\*\* \*\/` 注释/);
  assert.doesNotMatch(projectAgentsTemplate, /Vue `script setup`/);
  assert.match(projectAgentsTemplate, /### 文档与收尾/);
  assert.doesNotMatch(projectAgentsTemplate, /\.agent\/comment\.md`（若存在）/);
  assert.doesNotMatch(projectAgentsTemplate, /都必须参考 `\.agent\/comment\.md`/);
  assert.equal(projectClaudeTemplate, projectAgentsTemplate);
  assert.match(apiRule, /<!-- aimin-skill-version: 0\.1\.0 -->/);
  assert.match(commentRule, /<!-- aimin-skill-version: 0\.1\.0 -->/);
  assert.match(namingRule, /<!-- aimin-skill-version: 0\.1\.0 -->/);
  assert.equal(constantsIndexTemplate.version, '0.1.0');
  assert.equal(utilsIndexTemplate.version, '0.1.0');
  assert.match(projectLintTemplate, /<!-- aimin-skill-version: 0\.1\.0 -->/);
  assert.match(projectLintTemplate, /\.agent\/index\/constants\.json/);
  assert.match(projectLintTemplate, /\.agent\/index\/utils\.json/);
  assert.doesNotMatch(projectLintTemplate, /\.agent\/comment\.md/);
  assert.doesNotMatch(projectLintTemplate, /\.agent\/naming\.md/);
  assert.equal(manifest.marketplaceName, 'aimin-skill');
  assert.equal(manifest.pluginName, 'am');
  assert.equal(manifest.platform, process.platform === 'win32' ? 'windows' : 'mac');
  assert.equal(manifest.toolResults.length, 2);
  assert.ok(claudeInstalled.plugins['am@aimin-skill']);
  assert.match(codexConfig, /\[marketplaces\.aimin-skill\]/);
});

test('init can dispatch to the windows installer explicitly', async () => {
  const homeDir = await createTempHomeDir();
  const env = await createMockToolEnv(homeDir);

  await initUserInstall({
    env,
    homeDir,
    platform: 'win32',
    repoRoot
  });

  const manifest = JSON.parse(
    await readInstalledFile(homeDir, '.aimin-skill-marketplace/.aimin-skill-manifest.json')
  );
  const initCommand = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/commands/init.md'
  );

  assert.equal(manifest.platform, 'windows');
  assert.match(initCommand, /固定创建或更新这些项目文件/);
  assert.match(initCommand, /`AGENTS\.md`/);
  assert.match(initCommand, /`CLAUDE\.md`/);
  assert.match(initCommand, /\.agent\/api\.md/);
  assert.match(initCommand, /\.agent\/comment\.md/);
  assert.match(initCommand, /\.agent\/naming\.md/);
  assert.doesNotMatch(initCommand, /SymbolicLink/);
});

test('init is idempotent and doctor reports ready after install', async () => {
  const homeDir = await createTempHomeDir();
  const env = await createMockToolEnv(homeDir);
  await initUserInstall({ env, homeDir, repoRoot });
  await initUserInstall({ env, homeDir, repoRoot });

  const report = await createDoctorReport({ homeDir, repoRoot });
  assert.equal(report.tools.length, 2);
  assert.ok(report.tools.every(toolReport => toolReport.status === 'ready'));
  assert.ok(report.tools.every(toolReport => toolReport.bundleStatus === 'ready'));
  assert.ok(report.tools.every(toolReport => toolReport.commandReports.length === 5));
  assert.ok(
    report.tools
      .filter(toolReport => toolReport.tool.key === 'codex')
      .every(toolReport => toolReport.codexUserSkillReports.length === 6)
  );
  assert.ok(
    report.tools.every(toolReport =>
      toolReport.commandReports.every(commandReport =>
        commandReport.commandStatus === 'ready' && commandReport.skillStatus === 'ready'
      )
    )
  );
  assert.ok(
    report.tools
      .filter(toolReport => toolReport.tool.key === 'codex')
      .every(toolReport =>
        toolReport.codexUserSkillReports.every(skillReport => skillReport.skillStatus === 'ready')
      )
  );
});

test('init --force rebuilds marketplace bundle and removes stale files', async () => {
  const homeDir = await createTempHomeDir();
  const env = await createMockToolEnv(homeDir);
  const staleFilePath = path.join(
    homeDir,
    '.aimin-skill-marketplace',
    'plugins',
    'am',
    'commands',
    'obsolete.md'
  );

  await initUserInstall({ env, homeDir, repoRoot });
  await fs.writeFile(staleFilePath, '# stale\n', 'utf8');
  await initUserInstall({ env, force: true, homeDir, repoRoot });

  await assert.rejects(
    fs.readFile(staleFilePath, 'utf8'),
    /ENOENT/
  );
});

test('init falls back to remove and add when Claude marketplace update fails', async () => {
  const homeDir = await createTempHomeDir();
  const initialEnv = await createMockToolEnv(homeDir);
  await initUserInstall({ env: initialEnv, homeDir, repoRoot });

  const fallbackEnv = await createMockToolEnv(homeDir, { claudeUpdateShouldFail: true });
  const result = await initUserInstall({ env: fallbackEnv, homeDir, repoRoot });

  assert.equal(
    result.results.find(item => item.tool.key === 'claude')?.marketplaceStatus,
    're-added'
  );
});

test('init strips debugger env before invoking external CLIs', async () => {
  const homeDir = await createTempHomeDir();
  const env = await createMockToolEnv(homeDir, { failIfDebuggerEnvPresent: true });
  env.NODE_OPTIONS = '--inspect=0';
  env.NODE_INSPECT_RESUME_ON_START = '1';
  env.VSCODE_INSPECTOR_OPTIONS = '{"waitForDebugger":""}';

  const result = await initUserInstall({ env, homeDir, repoRoot });

  assert.ok(result.results.every(item => item.status === 'ready'));
});

test('init tolerates missing Claude marketplace during fallback remove', async () => {
  const homeDir = await createTempHomeDir();
  const initialEnv = await createMockToolEnv(homeDir);
  await initUserInstall({ env: initialEnv, homeDir, repoRoot });

  const fallbackEnv = await createMockToolEnv(homeDir, {
    claudeRemoveShouldFailMissing: true,
    claudeUpdateShouldFail: true
  });
  const result = await initUserInstall({ env: fallbackEnv, homeDir, repoRoot });

  assert.equal(
    result.results.find(item => item.tool.key === 'claude')?.marketplaceStatus,
    're-added'
  );
});
