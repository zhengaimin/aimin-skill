# aimin-skill 规则总览

这个目录会被复制到本地 `am` plugin 的 `references/` 目录，作为命令运行时的参考资料。

## 适用场景

- 初始化项目内的 `AGENTS.md`、`CLAUDE.md` 与 `.agent/` 规范目录
- 按 Aimin 规范新增接口、类型、枚举
- 根据项目类型加载 admin、tauri、uni 的补充规则

## 项目约束

- **不要过度封装**：优先保持实现直接、可读
- **命名简单化**：优先短而清晰的命名，避免冗长命名链
- **禁止无语义缩写**：如 `a1`、`tmp2`、`xx`
- **注释规范独立维护**：统一参考 `comment.md`
- **代码改动后做定向 lint**：只校验本次修改文件，优先最小范围

## 规则索引

| 文件                      | 说明                              |
| ------------------------- | --------------------------------- |
| `SKILL.md`                | skill 入口与路由规则              |
| `README.md`               | skill 规则总览                    |
| `project/AGENTS.md`       | 项目根目录 `AGENTS.md` 渐进式模板 |
| `project/CLAUDE.md`       | 项目根目录 `CLAUDE.md` 渐进式模板 |
| `project/scripts/lint.md` | 项目侧 lint SOP 模板              |
| `comment.md`              | 注释规范                          |
| `naming.md`               | 命名规范                          |
| `constant.md`             | 常量与枚举规范                    |
| `api.md`                  | 接口与类型规范                    |
| `index/constants.json`    | 常量索引模板                      |
| `index/utils.json`        | 公共方法索引模板                  |
| `vue.md`                  | Vue 组件规范                      |
| `unocss.md`               | UnoCSS 样式规范                   |
| `admin/rules.md`          | 后台管理总规则                    |
| `admin/modal.md`          | 弹窗模板                          |
| `admin/table.md`          | 表格模板                          |
| `tauri/rules.md`          | Tauri 规则                        |
| `uni/rules.md`            | UniApp 规则                       |

## 配套命令

| 命令       | 说明                                                |
| ---------- | --------------------------------------------------- |
| `/am:init` | 初始化当前项目的 `AGENTS.md`、`CLAUDE.md` 与 `.agent/` |
| `/am:api`  | 新增接口、类型与枚举                                |
| `/am:plan` | 手动触发 AI SOP 计划，聚焦当前项目代码与规则        |
