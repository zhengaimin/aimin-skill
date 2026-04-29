---
name: aimin-skill
description: 用于按 Aimin 规范初始化或升级 AGENTS.md、CLAUDE.md、.agent/api、.agent/comment、.agent/naming、.agent/index、.agent/scripts 与按项目类型命中的 admin/tauri/uni 目录、加载规则并新增接口
---

# Aimin Skill

## Use When

- 用户明确提到 `aimin-skill`、`am:init`、`am:api`、`am:plan`、`am:update`
- 需要初始化项目内的 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md` 与按项目类型命中的 `.agent/admin/**`、`.agent/tauri/**`、`.agent/uni/**`
- 需要按版本升级项目内的 `.agent/**` 与 `AGENTS.md` 的 `# Aimin-skill` 受管段落
- 需要按 Aimin 规范新增接口、类型、常量或项目类型规则

## Workflow

1. 先读 `README.md` 了解当前 skill 包结构
2. 如果任务是初始化项目，优先读 `template/AGENTS.md`、`template/CLAUDE.md`、`api.md`、`comment.md`、`naming.md`、`template/index/constants.json`、`template/index/utils.json`、`template/scripts/lint.md`，再按项目类型按需读 `template/admin/rules.md`、`template/admin/table.md`、`template/admin/modal.md`、`template/tauri/rules.md`、`template/uni/rules.md`
3. 如果任务是新增接口，优先读项目侧 `.agent/index/constants.json`、`.agent/index/utils.json`；如果项目里额外存在 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`，再按需读取；缺失时回退到安装包内的 `api.md`、`constant.md`、`comment.md`、`naming.md`
4. 仅在命中对应场景时按需加载：
   - `comment.md`
   - `naming.md`
   - `constant.md`
   - `api.md`
   - `template/index/constants.json`
   - `template/index/utils.json`
   - `template/scripts/lint.md`
   - `vue.md`
   - `unocss.md`
   - `template/admin/rules.md`
   - `template/admin/table.md`
   - `template/admin/modal.md`
   - `template/tauri/rules.md`
   - `template/uni/rules.md`
5. 先检查当前项目代码与目录，再判断项目类型和技术栈
6. 项目侧默认维护 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md`，以及按项目类型命中的 `.agent/admin/**`、`.agent/tauri/**`、`.agent/uni/**` 中一组
7. `/am:init` 只创建根目录 `AGENTS.md`、`CLAUDE.md` 与最小 `.agent/**` 规则集，不创建或修改 `.gitignore`
8. 禁止因为技术栈识别而额外生成 `.agent/constant.md`、`.agent/vue.md`、`.agent/unocss.md`；`admin`、`tauri`、`uni` 最多命中一组
9. 初始化时检查受管 `.agent/**` 文件版本；目标缺少版本号或版本不一致时，按参考文件强制更新
10. 更新 `AGENTS.md`、`CLAUDE.md` 时只替换 `# Aimin-skill` 受管段落，不改项目独有规则
11. `/am:update` 只升级 `.agent/**` 与 `AGENTS.md`，不更新 `CLAUDE.md`

## Constraints

- Simplicity First：只写解决当前问题所需的最少代码，不加未请求的功能、抽象、配置化或未来扩展点
- 不要过度封装，优先保持实现直接、可读；单次使用的逻辑不要抽成公共层
- Surgical Changes：只修改与任务直接相关的代码，不顺手重构、格式化、改注释或删除无关旧代码
- 每一处改动都必须能对应到用户请求，发现无关问题只在交付中说明，不直接处理
- 命名优先短而清晰，避免冗长命名链
- 禁止无语义缩写，如 `a1`、`tmp2`、`xx`
- `cfg`、`ctx`、`ref` 等常见缩写需要补中文语义
- 只清理本次改动造成的未使用导入、变量或函数
- 如果会话中修改了代码，收尾前对本次修改文件执行 lint 校验，优先按文件路径或最小范围运行
- 只在当前项目工作区内创建或修改文件，不要编辑已安装的 skill 目录
