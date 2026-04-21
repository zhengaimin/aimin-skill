# aimin-skill

本地 npm CLI 包，用来把 Aimin 的命令与 skill 同时注入到 Claude Code 和 Codex。

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

执行 `aimin-skill init` 后，会把同一套内容安装到以下目录：

- `~/.claude/commands/`
- `~/.claude/skills/aimin-skill/`
- `~/.codex/commands/`
- `~/.codex/skills/aimin-skill/`

当前会生成两个显式命令：

- `/aimin-init`：按 Aimin 规范初始化当前项目的 `.agent/` 目录
- `/aimin-api`：按 Aimin 规范新增接口、类型与枚举

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
skills/
├── SKILL.md               # Claude Code / Codex skill 入口
├── README.md              # 规则总览
├── command/
│   ├── init.md            # 初始化说明
│   └── api.md             # 接口说明
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
- 默认注入用户级目录，不做项目级 `.claude` / `.codex` 模式
- `--force` 只清理旧的受管文件，不会覆盖同名用户自定义命令

## 命令

```bash
aimin-skill init [--user] [--force]
aimin-skill doctor [--user]
```

`--user` 目前是默认模式，占位保留给后续扩展。
