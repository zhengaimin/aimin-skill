# aimin-skill

`aimin-skill` 是一个本地 npm CLI，用来把 Aimin 的 Claude Code / Codex 命令、skills 与规则文件打包成本地 marketplace/plugin，并注册到当前用户环境。

它适合把同一套团队规范安装到多个项目中：初始化项目规则、按规范新增接口、生成 UI 需求和设计产物、按阿里风格 review 代码、表格化归档当前会话，并在 Claude Code 与 Codex 中保持一致入口。

## 功能概览

- 安装本地 `aimin-skill` marketplace 与 `am` plugin。
- 注册到 Claude Code 与 Codex 的用户级 marketplace。
- 为 Claude Code 提供 `/am:init`、`/am:api`、`/am:requirement`、`/am:design`、`/am:review`、`/am:update`、`/am:session` 命令。
- 为 Codex 提供 `$am`、`$am-init`、`$am-api`、`$am-requirement`、`$am-design`、`$am-review`、`$am-update`、`$am-session` skills。
- `/am:session` 与 `$am-session` 会把当前会话中已确认的信息整理为 Markdown 文档，并优先使用表格呈现。
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

### CLI 参数

| 参数 | 适用命令 | 说明 |
| --- | --- | --- |
| `--user` | `init`、`doctor` | 兼容用户级安装语义，当前安装器默认就是用户级安装。 |
| `--force` | `init` | 删除并重建 `~/.aimin-skill-marketplace/`，同时清理受管的 Codex user skills 后重新生成。 |
| `--home <dir>` | `init`、`doctor` | 指定用户目录，主要用于测试、临时验证或多环境隔离。 |

### CLI 使用场景

| 场景 | 命令 |
| --- | --- |
| 首次安装本地命令与 skills | `aimin-skill init` |
| 修改了 `commands/`、`skills/` 或安装生成逻辑后重新安装 | `aimin-skill init --force` |
| 检查 Claude Code / Codex 是否都注册成功 | `aimin-skill doctor` |
| 在临时 HOME 中验证安装产物 | `aimin-skill init --home ./tmp-home` |

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
├── am-requirement/
├── am-design/
├── am-review/
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
| `/am:requirement` | 根据产品 prompt 在 `.agent/ui/{feature-name}/` 生成需求文档包。 | `/am:requirement 设计一个面向独立音乐人的移动端音乐 App` |
| `/am:design` | 根据 `.agent/ui/{feature-name}/` 需求文档使用 Pencil 生成 UI 设计稿。 | `/am:design music-app design-source=codex` |
| `/am:review` | 按 Aimin 与阿里风格 review 当前代码，输出问题、优化建议与可改动点。 | `/am:review 检查当前工作区改动是否符合阿里风格` |
| `/am:update` | 按版本号升级项目侧 `.agent/**`，并只更新 `AGENTS.md` 的 `# Aimin-skill` 段落。 | `/am:update 升级当前项目规则` |
| `/am:session` | 提取当前会话中已确认的信息，优先用 Markdown 表格整理，并输出到 `.agent/docs/`。 | `/am:session 将本次接口讨论整理为实现记录` |

### Claude Code 命令产物

| 命令 | 主要输入 | 主要输出 |
| --- | --- | --- |
| `/am:init` | 当前项目目录、项目类型线索 | `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md`，以及命中的 `.agent/admin/**`、`.agent/tauri/**` 或 `.agent/uni/**` |
| `/am:api` | 接口需求、项目侧 `.agent/api.md` 和索引文件 | 接口请求函数、请求/响应类型、必要的枚举或常量索引更新 |
| `/am:requirement` | 产品 prompt、目标用户、平台、范围约束 | `.agent/ui/{feature-name}/需求分析.md`、`线框图.md`、`设计说明.md`、`开发说明.md`、`验收标准.md` |
| `/am:design` | `.agent/ui/{feature-name}/` 需求文档包 | `.agent/ui/{feature-name}/{design-source}/{design-source}.pen`、`images/`、`svg/`、`preview/` |
| `/am:review` | 当前工作区改动、指定文件或模块 | 按 Aimin 与阿里风格整理的问题、优化建议与可改动点 |
| `/am:update` | 当前项目目录、已安装参考模板 | 升级后的 `.agent/**` 规则文件和 `AGENTS.md` 受管段落 |
| `/am:session` | 当前会话中已确认的信息 | `.agent/docs/{filename}.md` |

### UI 需求到设计流程

先用 `/am:requirement` 把一句话想法沉淀成需求包：

```text
/am:requirement 设计一个面向独立音乐人的移动端音乐 App，核心是作品发布、数据概览和粉丝互动
```

生成目录示例：

```text
.agent/ui/music-app/
├── 需求分析.md
├── 线框图.md
├── 设计说明.md
├── 开发说明.md
└── 验收标准.md
```

再用 `/am:design` 读取需求包并生成 Pencil 设计产物：

```text
/am:design music-app design-source=codex
```

设计目录示例：

```text
.agent/ui/music-app/codex/
├── codex.pen
├── images/
├── svg/
└── preview/
```

## Codex skills

| Skill | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| `$am` | 路由 skill | 根据上下文选择初始化、接口、需求、设计、计划、代码 review、升级或会话归档流程。 | `$am init 当前 admin 项目` |
| `$am-init` | 命令 skill | 等价于初始化流程，按项目类型写入规则文件。 | `$am-init 初始化 AGENTS.md、CLAUDE.md 和 .agent` |
| `$am-api` | 命令 skill | 等价于接口流程，新增接口、类型、枚举并维护索引。 | `$am-api 新增设备分组列表查询接口` |
| `$am-requirement` | 命令 skill | 等价于需求生成流程，输出 `.agent/ui/{feature-name}/` 需求文档包。 | `$am-requirement 设计一个面向独立音乐人的移动端音乐 App` |
| `$am-design` | 命令 skill | 等价于 UI 设计流程，根据需求文档生成 Pencil 设计稿。 | `$am-design music-app design-source=codex` |
| `$am-review` | 命令 skill | 等价于代码 review 流程，按 Aimin 与阿里风格输出问题和优化建议。 | `$am-review 检查当前工作区改动` |
| `$am-update` | 命令 skill | 等价于升级流程，按版本更新 `.agent/**` 与 `AGENTS.md` 的受管段落。 | `$am-update 升级当前项目规则` |
| `$am-session` | 命令 skill | 等价于会话归档流程，优先用 Markdown 表格输出 `.agent/docs/*.md`。 | `$am-session 归档当前会话` |

## 会话归档格式

`/am:session` 和 `$am-session` 默认新建 Markdown 文档，不覆盖已有文件。归档内容只提取当前会话中已经确认的信息，推荐按以下表格化结构整理：

| 部分 | 内容 |
| --- | --- |
| 会话主题 | 记录主题、归档时间和归档重点。 |
| 背景与目标 | 拆分当前背景和本次目标。 |
| 已确认信息 | 记录明确的需求、限制、路径、命令、接口名、字段名和验收口径。 |
| 决策与约束 | 记录已经确定的做法、边界和影响。 |
| 涉及文件或模块 | 记录相关路径、模块作用和当前状态。 |
| 待确认事项 | 对不确定内容标记为“待确认”，不补写成确定事实。 |
| 后续动作 | 按顺序记录可执行的下一步。 |

### Codex 调用规则

- `$am` 是路由入口，会根据用户消息选择 `$am-init`、`$am-api`、`$am-requirement`、`$am-design`、`$am-review`、`$am-update` 或 `$am-session`。
- 目标明确时，优先直接调用具体 skill，例如 `$am-requirement`、`$am-design` 或 `$am-review`。
- `$am-requirement` 只生成需求文档，不生成 Pencil 设计稿。
- `$am-design` 必须先读取 `.agent/ui/{feature-name}/` 下的需求文档；缺少需求文档时应停止并说明缺失项。
- `$am-review` 默认只输出 review 结果，只有用户明确要求修复时才进入代码修改。

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
├── requirement.md          # /am:requirement 命令源文件
├── design.md               # /am:design 命令源文件
├── review.md               # /am:review 命令源文件
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
```

## 开发与验证

```bash
npm run lint
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
