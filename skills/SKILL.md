---
name: aimin-skill
description: 用于在 Vue、Admin、Tauri、Uni 项目中按 Aimin 规范初始化 AGENTS.md、CLAUDE.md 与 .agent 目录、加载规则并新增接口
---

# Aimin Skill

## Use When

- 用户明确提到 `aimin-skill`、`am:init`、`am:api`、`am:plan`
- 需要初始化项目内的 `AGENTS.md`、`CLAUDE.md` 与 `.agent/` 规范目录
- 需要按 Aimin 规范新增接口、类型、常量或项目类型规则

## Workflow

1. 先读 `README.md` 了解当前 skill 包结构
2. 如果任务是初始化项目，优先读 `project/AGENTS.md`、`project/CLAUDE.md`、`project/scripts/lint.md`
3. 如果任务是新增接口，优先读项目侧 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/index/constants.json`、`.agent/index/utils.json`；缺失时再回退到安装包内的 `api.md`、`constant.md`、`comment.md`、`naming.md`
4. 仅在命中对应场景时按需加载：
   - `comment.md`
   - `naming.md`
   - `constant.md`
   - `api.md`
   - `index/constants.json`
   - `index/utils.json`
   - `project/AGENTS.md`
   - `project/CLAUDE.md`
   - `project/scripts/lint.md`
   - `vue.md`
   - `unocss.md`
   - `admin/rules.md`
   - `admin/table.md`
   - `admin/modal.md`
   - `tauri/rules.md`
   - `uni/rules.md`
5. 先检查当前项目代码与目录，再判断项目类型和技术栈
6. 根目录 `AGENTS.md` 与 `CLAUDE.md` 必须保持渐进式披露：默认只放入口与路由表，详细规范下沉到 `.agent/**`
7. 项目侧默认只维护 `AGENTS.md`、`CLAUDE.md`、`.agent/index/**`、`.agent/scripts/lint.md`；其余 `.agent/**` 通用规则优先使用系统安装参考的软链接并视为只读
8. 禁止因为技术栈识别而生成项目定制版 `.agent/naming.md`、`.agent/constant.md`、`.agent/api.md`、`.agent/tauri/rules.md` 等普通文件；若误创建，必须删掉并改成软链接

## Constraints

- 不要过度封装，优先保持实现直接、可读
- 命名优先短而清晰，避免冗长命名链
- 禁止无语义缩写，如 `a1`、`tmp2`、`xx`
- `cfg`、`ctx`、`ref` 等常见缩写需要补中文语义
- 如果会话中修改了代码，收尾前对本次修改文件执行 lint 校验，优先按文件路径或最小范围运行
- 只在当前项目工作区内创建或修改文件，不要编辑已安装的 skill 目录
