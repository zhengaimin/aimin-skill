/**
 * aimin-skill 安装器测试
 * 校验用户目录注入、重复执行与冲突检测行为
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
 * 读取目标文件内容
 * @param {string} homeDir 临时 home 目录
 * @param {string} relativePath 相对路径
 * @returns {Promise<string>}
 */
async function readInstalledFile(homeDir, relativePath) {
  return fs.readFile(path.join(homeDir, relativePath), 'utf8');
}

test('init installs skill bundle and commands into both tools', async () => {
  const homeDir = await createTempHomeDir();
  await initUserInstall({ homeDir, repoRoot });

  const codexCommand = await readInstalledFile(homeDir, '.codex/commands/aimin-init.md');
  const claudeCommand = await readInstalledFile(homeDir, '.claude/commands/aimin-api.md');
  const codexSkill = await readInstalledFile(homeDir, '.codex/skills/aimin-skill/SKILL.md');
  const claudeManifest = JSON.parse(
    await readInstalledFile(homeDir, '.claude/skills/aimin-skill/.aimin-skill-manifest.json')
  );

  assert.match(codexCommand, /Managed by aimin-skill/);
  assert.match(claudeCommand, /\/aimin-api/);
  assert.match(codexSkill, /name: aimin-skill/);
  assert.equal(claudeManifest.managedBy, 'aimin-skill');
  assert.equal(claudeManifest.tool, 'claude');
});

test('init is idempotent and doctor reports ready after install', async () => {
  const homeDir = await createTempHomeDir();
  await initUserInstall({ homeDir, repoRoot });
  await initUserInstall({ homeDir, repoRoot });

  const report = await createDoctorReport({ homeDir, repoRoot });
  assert.equal(report.tools.length, 2);
  assert.ok(report.tools.every(toolReport => toolReport.status === 'ready'));
  assert.ok(report.tools.every(toolReport => toolReport.skillStatus === 'ready'));
  assert.ok(
    report.tools.every(toolReport =>
      toolReport.commandReports.every(commandReport => commandReport.status === 'ready')
    )
  );
});

test('init rejects unmanaged command collisions', async () => {
  const homeDir = await createTempHomeDir();
  const collisionPath = path.join(homeDir, '.claude', 'commands', 'aimin-init.md');

  await fs.mkdir(path.dirname(collisionPath), { recursive: true });
  await fs.writeFile(collisionPath, '# custom command\n', 'utf8');

  await assert.rejects(
    initUserInstall({ homeDir, repoRoot }),
    /发现同名未受管命令文件/
  );
});
