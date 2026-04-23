# aimin-skill

本地 npm CLI，用来把 Aimin 的命令与规则打包成可安装的 marketplace/plugin，并注册到 Claude Code 和 Codex。

## 命令表格

| 命令 | 说明 |
| --- | --- |
| `npm install -g .` | 本地全局安装 `aimin-skill` |
| `aimin-skill init [--force]` | 安装并注入本地 marketplace/plugin；`--force` 会重建安装内容 |
| `aimin-skill doctor` | 检查 Claude Code、Codex、marketplace/plugin 是否安装完成 |
| `pnpm run install:init` | 一次性本地安装并执行 `init` |
| `pnpm run install:init:force` | 强制刷新后重新执行 `init` |
| `pnpm run install:doctor` | 一次性本地执行 `doctor` |
| `pnpm run setup` | `pnpm run install:init` 的短别名 |
| `pnpm run setup:force` | `pnpm run install:init:force` 的短别名 |
| `pnpm run doctor` | `pnpm run install:doctor` 的短别名 |
| `pnpm run local:init` | 与 `pnpm run install:init` 相同 |
| `pnpm run local:init:force` | 与 `pnpm run install:init:force` 相同 |
| `pnpm run local:doctor` | 与 `pnpm run install:doctor` 相同 |
| `npm run lint` | 检查仓库资源完整性 |
| `npm test` | 运行安装逻辑测试 |

## 目录结构

```text
bin/
└── aimin-skill.js         # CLI 入口

commands/
├── api.md                 # /am:api 命令源文件
├── init.md                # /am:init 命令源文件
└── plan.md                # /am:plan 命令源文件

scripts/
├── lint.mjs               # 资源检查
└── local-dlx.mjs          # 直接执行当前仓库 CLI 的本地入口

skills/
├── SKILL.md               # skill 入口
├── README.md              # 规则总览
├── admin/                 # admin 规则
├── project/               # 项目初始化模板
├── tauri/                 # tauri 规则
├── uni/                   # uni 规则
└── ...                    # 通用命名、接口、样式等规则

src/cli/
├── index.js               # 命令解析入口
├── constants.js           # 稳定常量
├── doctor.js              # 安装诊断
├── templates.js           # 模板生成
├── utils.js               # 文件工具
└── install/
    ├── index.js           # 按平台分发安装逻辑
    ├── mac.js             # macOS / POSIX 安装
    └── windows.js         # Windows 安装

test/
└── install.test.js        # 安装逻辑测试
```

## 设计理念

- 只解决本地安装与注入，不处理 npm 公开发布。
- 安装动作保持显式，统一通过 `aimin-skill init` 触发，不做 `postinstall` 自动写入。
- 默认面向用户级 Claude Code / Codex 环境，不引入项目级安装复杂度。
- 命令源文件、安装逻辑、规则资源分层放置，方便维护和扩展。
- Claude Code 用 `/am:*`，Codex 用 `$am*`，统一一套内容，按各自入口适配。
