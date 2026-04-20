# aimin-skill

> Vue 项目开发规范 Skill，用于 AI 辅助代码生成

## 项目类型

| 类型   | 说明                 | 规则文件               |
| ------ | -------------------- | ---------------------- |
| admin  | 后台管理系统         | `admin/rules.md`       |
| tauri  | Tauri 桌面应用       | `tauri/rules.md`       |
| uni    | UniApp 跨平台应用    | `uni/rules.md`         |
| web    | 纯前端项目           | 基础规则               |

## 目录结构

```text
skills/
├── naming.md              # 命名规范（通用）
├── api.md                 # 接口与类型规范
├── constant.md            # 常量与枚举规范
├── vue.md                 # Vue 组件规范
├── unocss.md              # UnoCSS 样式规范
├── command/               # 命令详细说明
│   ├── init.md            # --init 初始化
│   └── api.md             # --api 新增接口
├── admin/                 # 后台管理专用规则
│   ├── rules.md           # 总规则
│   ├── table.md           # 表格 CRUD 页面模板
│   └── modal.md           # 弹窗模板
├── tauri/                 # Tauri 专用规则
│   └── rules.md           # IPC 命令、窗口管理
├── uni/                   # UniApp 专用规则
│   └── rules.md           # 生命周期、条件编译
└── index/                 # 索引文件
    └── constants.json     # 常量索引（空模板）
```

---

## 命令

| 命令     | 说明         | 详细文档                  |
| -------- | ------------ | ------------------------- |
| `--init` | 初始化项目   | `command/init.md`         |
| `--api`  | 新增接口     | `command/api.md`          |

---

## 项目约束（强制）

- **不要过度封装**：优先保持实现直接、可读
- **命名简单化**：优先短而清晰的命名，避免冗长命名链
- **禁止无语义缩写**：如 `a1`、`tmp2`、`xx`
- **常见缩写需注释**：`cfg`、`ctx`、`ref` 等需补中文注释

---

## 使用方式

### 1. 初始化项目

将 `skills/` 目录复制到目标项目的 `.agent/` 目录：

```bash
cp -r skills/* D:\Code\你的项目\.agent\
```

### 2. 更新 CLAUDE.md

在项目根目录 `CLAUDE.md` 中添加：

```markdown
请先阅读 .agent/README.md 了解开发规范。
```

---

## admin 页面开发

| 场景         | 文件结构                                              |
| ------------ | ----------------------------------------------------- |
| 表格 + 弹窗  | `index.vue` + `modal/{Entity}.vue` + `modal/Detail.vue` |
| 页面局部类型 | `types.ts`（可选）                                    |
| 页面局部常量 | `constants.ts`（仅复用型枚举/映射）                   |
| 工具函数     | `utils/payload.ts`（提交字段 > 3 个时）               |