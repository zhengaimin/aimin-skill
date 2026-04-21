# aimin-skill 规则总览

这个目录会被安装为 Claude Code 与 Codex 的 `aimin-skill` skill 根目录。

## 适用场景

- 初始化项目内的 `.agent/` 规范目录
- 按 Aimin 规范新增接口、类型、枚举
- 根据项目类型加载 admin、tauri、uni 的补充规则

## 项目约束

- **不要过度封装**：优先保持实现直接、可读
- **命名简单化**：优先短而清晰的命名，避免冗长命名链
- **禁止无语义缩写**：如 `a1`、`tmp2`、`xx`
- **常见缩写需注释**：`cfg`、`ctx`、`ref` 等

## 规则索引

| 文件              | 说明                 |
| ----------------- | -------------------- |
| `SKILL.md`        | skill 入口与路由规则 |
| `naming.md`       | 命名规范             |
| `constant.md`     | 常量与枚举规范       |
| `api.md`          | 接口与类型规范       |
| `vue.md`          | Vue 组件规范         |
| `unocss.md`       | UnoCSS 样式规范      |
| `admin/rules.md`  | 后台管理总规则       |
| `admin/modal.md`  | 弹窗模板             |
| `admin/table.md`  | 表格模板             |
| `tauri/rules.md`  | Tauri 规则           |
| `uni/rules.md`    | UniApp 规则          |

## 配套命令

| 命令           | 说明                                |
| -------------- | ----------------------------------- |
| `/aimin-init`  | 初始化当前项目的 `.agent/` 规范目录 |
| `/aimin-api`   | 新增接口、类型与枚举                |
