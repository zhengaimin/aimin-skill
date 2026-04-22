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
import { initUserInstall } from '../src/cli/install.js';

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
async function createMockToolEnv(homeDir) {
  const binDir = path.join(homeDir, 'bin');
  const claudePath = path.join(binDir, 'claude');
  const codexPath = path.join(binDir, 'codex');

  await fs.mkdir(binDir, { recursive: true });

  await fs.writeFile(claudePath, `#!/bin/sh
set -eu
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
  if [ ! -f "$HOME/.codex/config.toml" ]; then
    cat > "$HOME/.codex/config.toml" <<EOF
[marketplaces.aimin-skill]
last_updated = "2026-04-22T00:00:00Z"
source_type = "local"
source = "upgrade"
EOF
  fi
  exit 0
fi

exit 0
`, 'utf8');

  await fs.chmod(claudePath, 0o755);
  await fs.chmod(codexPath, 0o755);

  return {
    ...process.env,
    HOME: homeDir,
    PATH: `${binDir}:${process.env.PATH ?? ''}`
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
  const planSkill = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/skills/plan/SKILL.md'
  );
  const projectAgentsTemplate = await readInstalledFile(
    homeDir,
    '.aimin-skill-marketplace/plugins/am/references/project/AGENTS.md'
  );
  const manifest = JSON.parse(
    await readInstalledFile(homeDir, '.aimin-skill-marketplace/.aimin-skill-manifest.json')
  );
  const claudeInstalled = JSON.parse(
    await readInstalledFile(homeDir, '.claude/plugins/installed_plugins.json')
  );
  const codexConfig = await readInstalledFile(homeDir, '.codex/config.toml');

  assert.match(initCommand, /Managed by aimin-skill/);
  assert.match(initCommand, /\/am:init/);
  assert.match(initCommand, /## 执行要求/);
  assert.doesNotMatch(initCommand, /The user invoked this command/);
  assert.match(planSkill, /name: plan/);
  assert.match(planSkill, /调研/);
  assert.match(planSkill, /拉取线上最新代码/);
  assert.match(planSkill, /解决冲突/);
  assert.match(projectAgentsTemplate, /\.agent\/index\/constants\.json/);
  assert.equal(manifest.marketplaceName, 'aimin-skill');
  assert.equal(manifest.pluginName, 'am');
  assert.equal(manifest.toolResults.length, 2);
  assert.ok(claudeInstalled.plugins['am@aimin-skill']);
  assert.match(codexConfig, /\[marketplaces\.aimin-skill\]/);
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
  assert.ok(report.tools.every(toolReport => toolReport.commandReports.length === 3));
  assert.ok(
    report.tools.every(toolReport =>
      toolReport.commandReports.every(commandReport =>
        commandReport.commandStatus === 'ready' && commandReport.skillStatus === 'ready'
      )
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
