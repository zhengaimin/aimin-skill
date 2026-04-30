# aimin-skill

`aimin-skill` 是一个本地 npm CLI，用来把 Aimin 的 Claude Code / Codex 命令、skills 与规则文件打包成本地 marketplace/plugin，并注册到当前用户环境。

它适合把同一套团队规范安装到多个项目中：初始化项目规则、按规范新增接口、输出实施计划、归档当前会话，并在 Claude Code 与 Codex 中保持一致入口。

## 功能概览

- 安装本地 `aimin-skill` marketplace 与 `am` plugin。
- 注册到 Claude Code 与 Codex 的用户级 marketplace。
- 为 Claude Code 提供 `/am:init`、`/am:api`、`/am:plan`、`/am:update`、`/am:session` 命令。
- 为 Codex 提供 `$am`、`$am-init`、`$am-api`、`$am-plan`、`$am-update`、`$am-session` skills。
- 复制 `skills/` 规则资料到 plugin 的 `references/` 目录，供命令运行时读取。
- 支持 `doctor` 检查安装状态，支持 `--force` 重建本地安装内容。

## 环境要求

- Node.js `>= 18`
- npm 或 pnpm
- 已安装 Claude Code CLI（命令名：`claude`）
- 已安装 Codex CLI（命令名：`codex`）

> 如果只使用其中一个工具，也可以安装本包；`doctor` 会展示缺失或部分安装状态。

## 快速安装

在本仓库根目录执行：

```bash
npm install -g .
aimin-skill init
aimin-skill doctor
```

也可以使用 pnpm 的本地脚本：

```bash
pnpm run setup
pnpm run doctor
```

强制重建本地 marketplace/plugin：

```bash
aimin-skill init --force
# 或
pnpm run setup:force
```

## CLI 命令

| 命令 | 说明 |
| --- | --- |
| `aimin-skill init` | 生成本地 marketplace/plugin，并注册到 Claude Code 与 Codex。 |
| `aimin-skill init --force` | 删除并重建本地 marketplace/plugin 后重新注册。 |
| `aimin-skill doctor` | 检查当前用户目录下 marketplace/plugin、命令和 skills 的安装状态。 |
| `aimin-skill --help` | 查看 CLI 帮助。 |
| `aimin-skill --version` | 输出当前版本。 |

## package scripts

| 脚本 | 说明 |
| --- | --- |
| `pnpm run setup` | 等同于本地执行 `aimin-skill init`。 |
| `pnpm run setup:force` | 等同于本地执行 `aimin-skill init --force`。 |
| `pnpm run doctor` | 等同于本地执行 `aimin-skill doctor`。 |
| `pnpm run install:init` | 本地执行 `init`，与 `setup` 相同。 |
| `pnpm run install:init:force` | 本地执行 `init --force`，与 `setup:force` 相同。 |
| `pnpm run install:doctor` | 本地执行 `doctor`，与 `doctor` 相同。 |
| `pnpm run local:init` | 本地执行 `init`，兼容别名。 |
| `pnpm run local:init:force` | 本地执行 `init --force`，兼容别名。 |
| `pnpm run local:doctor` | 本地执行 `doctor`，兼容别名。 |
| `npm run lint` | 检查仓库资源完整性。 |
| `npm test` | 运行安装逻辑测试。 |

## 安装后路径

执行 `aimin-skill init` 后，会在当前用户目录创建和更新以下内容：

```text
~/.aimin-skill-marketplace/
├── .aimin-skill-manifest.json
├── .claude-plugin/marketplace.json
├── .agents/plugins/marketplace.json
└── plugins/am/
    ├── .codex-plugin/plugin.json
    ├── commands/
    ├── skills/
    └── references/

~/.codex/skills/
├── am/
├── am-init/
├── am-api/
├── am-plan/
├── am-update/
└── am-session/
```

同时会尝试更新：

- Claude Code 用户级 marketplace/plugin 注册信息。
- Codex 用户级 marketplace 配置（`~/.codex/config.toml`）。

## Claude Code 命令

| 命令 | 说明 | 示例 |
| --- | --- | --- |
| `/am:init` | 初始化项目侧 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md`，并按项目类型包含 `admin`、`tauri` 或 `uni` 模板。 | `/am:init 当前 admin 项目，初始化规则文件` |
| `/am:api` | 按 Aimin 规范新增或更新接口、类型与枚举，并维护 `.agent/index/**` 索引。 | `/am:api 新增设备分组列表查询接口` |
| `/am:plan` | 手动输出 AI SOP 计划，聚焦当前项目代码与规则，不直接改代码。 | `/am:plan 为设备管理页新增批量分组能力` |
| `/am:update` | 按版本号升级项目侧 `.agent/**`，并只更新 `AGENTS.md` 的 `# Aimin-skill` 段落。 | `/am:update 升级当前项目规则` |
| `/am:session` | 提取当前会话中已确认的信息，并输出到 `.agent/docs/`。 | `/am:session 将本次接口讨论整理为实现记录` |

## Codex skills

| Skill | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| `$am` | 路由 skill | 根据上下文选择初始化、接口、计划或会话归档流程。 | `$am init 当前 admin 项目` |
| `$am-init` | 命令 skill | 等价于初始化流程，按项目类型写入规则文件。 | `$am-init 初始化 AGENTS.md、CLAUDE.md 和 .agent` |
| `$am-api` | 命令 skill | 等价于接口流程，新增接口、类型、枚举并维护索引。 | `$am-api 新增设备分组列表查询接口` |
| `$am-plan` | 命令 skill | 等价于计划流程，只输出 SOP 计划。 | `$am-plan 先规划批量分组实现步骤` |
| `$am-update` | 命令 skill | 等价于升级流程，按版本更新 `.agent/**` 与 `AGENTS.md` 的受管段落。 | `$am-update 升级当前项目规则` |
| `$am-session` | 命令 skill | 等价于会话归档流程，输出 `.agent/docs/*.md`。 | `$am-session 归档当前会话` |

## 规则资料

`skills/` 是命令和 skills 的规则来源，安装时会复制到 plugin 的 `references/` 目录。

| 文件或目录 | 说明 |
| --- | --- |
| `skills/SKILL.md` | skill 入口与路由规则。 |
| `skills/README.md` | 规则总览。 |
| `skills/api.md` | 接口与类型规范，初始化到 `.agent/api.md`。 |
| `skills/constant.md` | 常量与枚举规范。 |
| `skills/comment.md` | 注释规范，初始化到 `.agent/comment.md`。 |
| `skills/naming.md` | 命名规范，初始化到 `.agent/naming.md`。 |
| `skills/vue.md` | Vue 组件规范。 |
| `skills/unocss.md` | UnoCSS 样式规范。 |
| `skills/template/AGENTS.md` | 项目侧 `AGENTS.md` 模板。 |
| `skills/template/CLAUDE.md` | 项目侧 `CLAUDE.md` 模板。 |
| `skills/template/index/**` | 常量、公共方法索引模板。 |
| `skills/template/scripts/lint.md` | 项目侧 lint SOP 模板。 |
| `skills/template/admin/**` | 后台管理项目规则与表格、弹窗模板。 |
| `skills/template/tauri/**` | Tauri 项目规则。 |
| `skills/template/uni/**` | UniApp 项目规则。 |

## 项目结构

```text
bin/
└── aimin-skill.js          # CLI 入口

commands/
├── init.md                 # /am:init 命令源文件
├── api.md                  # /am:api 命令源文件
├── plan.md                 # /am:plan 命令源文件
├── update.md               # /am:update 命令源文件
└── session.md              # /am:session 命令源文件

scripts/
├── lint.mjs                # 资源完整性检查
└── local-dlx.mjs           # 本地运行当前仓库 CLI

skills/
├── SKILL.md                # skill 入口
├── README.md               # 规则总览
├── template/               # 项目初始化模板
└── *.md                    # 通用规则文件

src/cli/
├── index.js                # CLI 命令解析入口
├── constants.js            # 稳定常量
├── doctor.js               # 安装诊断
├── templates.js            # 模板生成
├── utils.js                # 文件工具
└── install/                # 平台安装逻辑

test/
└── install.test.js         # 安装逻辑测试
```

## 开发与验证

```bash
npm run lint
npm test
```

本项目不使用 `postinstall` 自动写入用户目录，所有安装动作都必须显式执行：

```bash
aimin-skill init
```

## 设计原则

- 本包只负责本地安装、注册与诊断，不负责 npm 公开发布流程。
- 安装动作保持显式，不在依赖安装阶段自动改写用户目录。
- Claude Code 使用 `/am:*` 命令，Codex 使用 `$am*` skills，共用同一套规则内容。
- 命令源文件、安装逻辑、规则资料分层维护，方便扩展和排查。
- 默认面向用户级 Claude Code / Codex 环境，不引入项目级安装复杂度。
