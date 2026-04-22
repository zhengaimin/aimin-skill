# aimin-skill

本地 npm CLI 包，用来把 Aimin 的命令参考与项目规则打包成一个本地 marketplace/plugin，并注册到 Claude Code 和 Codex。

## 快速开始

在仓库根目录执行本地安装：

```bash
npm install -g .
```

安装完成后执行注入：

```bash
aimin-skill init
```

检查安装状态：

```bash
aimin-skill doctor
```

## 注入结果

执行 `aimin-skill init` 后，会在用户目录下生成本地 marketplace root：

- `~/.aimin-skill-marketplace/`

然后注册到：

- Claude Code marketplace/plugin
- Codex marketplace/plugin

当前会生成三个显式命令：

- `/am:init`：按 Aimin 规范初始化当前项目的 `AGENTS.md`、`CLAUDE.md` 与 `.agent/` 目录
- `/am:api`：按 Aimin 规范新增接口、类型与枚举
- `/am:plan`：手动触发 AI SOP 计划，优先同步线上最新代码并处理冲突，固定输出调研、拆任务、实施、自检、交付 5 段

## 目录结构

```text
bin/
└── aimin-skill.js         # CLI 入口
src/cli/
├── index.js               # 命令解析
├── install.js             # 安装与注入逻辑
├── doctor.js              # 安装状态诊断
├── templates.js           # 命令模板生成
├── constants.js           # 稳定常量
└── utils.js               # 文件系统工具
commands/
├── api.md                 # /am:api 命令说明源文件
├── init.md                # /am:init 命令说明源文件
└── plan.md                # /am:plan 命令说明源文件
scripts/
└── lint.mjs               # 仓库资源完整性检查
skills/
├── SKILL.md               # Claude Code / Codex skill 入口
├── README.md              # 规则总览
├── project/               # 项目初始化模板
├── admin/                 # admin 专用规则
├── tauri/                 # tauri 专用规则
├── uni/                   # uni 专用规则
└── ...                    # 通用命名、接口、常量、样式规范
test/
└── install.test.js        # 逻辑性测试
```

## 设计说明

- 当前只做本地 npm 包能力，不处理公开 npm 发布
- 安装触发采用显式 `aimin-skill init`，不做 `postinstall` 自动写用户目录
- 默认注册用户级 Claude/Codex marketplace，不做项目级 `.claude` / `.codex` 模式
- `--force` 会重建本地 marketplace root
- 命令源文件统一放在 `commands/`，文件名与命令名保持一致，例如 `plan.md`
- 运行时的 `/am:*` 前缀由 plugin 名 `am` 提供，不依赖文件名带冒号，因此同时兼容 macOS 与 Windows

## 命令

```bash
aimin-skill init [--user] [--force]
aimin-skill doctor [--user]
npm run lint
```

`--user` 目前是默认模式，占位保留给后续扩展。
