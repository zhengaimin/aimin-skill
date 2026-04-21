---
name: aimin-skill
description: 用于在 Vue、Admin、Tauri、Uni 项目中按 Aimin 规范初始化 .agent 目录、加载规则并新增接口
---

# Aimin Skill

## Use When

- 用户明确提到 `aimin-skill`、`aimin-init`、`aimin-api`
- 需要初始化项目内的 `.agent/` 规范目录
- 需要按 Aimin 规范新增接口、类型、常量或项目类型规则

## Workflow

1. 先读 `README.md` 了解当前 skill 包结构
2. 如果任务是初始化项目，读 `command/init.md`
3. 如果任务是新增接口，读 `command/api.md`
4. 仅在命中对应场景时按需加载：
   - `naming.md`
   - `constant.md`
   - `api.md`
   - `vue.md`
   - `unocss.md`
   - `admin/rules.md`
   - `admin/table.md`
   - `admin/modal.md`
   - `tauri/rules.md`
   - `uni/rules.md`
5. 先检查当前项目代码与目录，再判断项目类型和技术栈

## Constraints

- 不要过度封装，优先保持实现直接、可读
- 命名优先短而清晰，避免冗长命名链
- 禁止无语义缩写，如 `a1`、`tmp2`、`xx`
- `cfg`、`ctx`、`ref` 等常见缩写需要补中文语义
- 只在当前项目工作区内创建或修改文件，不要编辑已安装的 skill 目录
