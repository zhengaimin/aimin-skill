<!-- aimin-skill-version: 0.1.4 -->

# aimin-skill 规则总览

这个目录会被复制到本地 `am` plugin 的 `references/` 目录，作为命令运行时的参考资料。

## 适用场景

- 初始化项目内的 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md` 与按项目类型命中的 `admin/tauri/uni` 目录
- 按版本升级项目内 `.agent/**` 与 `AGENTS.md` 的 `# Aimin-skill` 受管段落
- 按 Aimin 规范新增接口、类型、枚举
- 根据产品 prompt 在 `.agent/ui/{feature-name}/` 下生成需求文档包
- 根据 `.agent/ui/{feature-name}/` 需求文档生成 Pencil UI 设计稿
- 按 Aimin 与阿里风格 review 当前代码，输出问题、优化建议与可改动点
- 将关键功能点、页面和当前会话整理为中文表格文档，归档到 `.agent/archive/`
- 同步维护目标项目 `AGENTS.md` 的项目级规则表，记录修改范围和对应归档文档
- 将客户、后台、产品方提供的原始资料保留在 `.agent/docs/`
- 根据项目类型从 `template/admin`、`template/tauri`、`template/uni` 加载补充模板

## 项目约束

- **Simplicity First**：只写解决当前问题所需的最少代码，不加未请求的功能、抽象、配置化或未来扩展点
- **不要过度封装**：优先保持实现直接、可读；单次使用的逻辑不要抽成公共层
- **Surgical Changes**：只修改与任务直接相关的代码，不顺手重构、格式化、改注释或删除无关旧代码
- **命名简单化**：优先短而清晰的命名，避免冗长命名链
- **禁止无语义缩写**：如 `a1`、`tmp2`、`xx`
- **注释规范独立维护**：统一参考 `comment.md`
- **代码改动后做定向 lint**：只校验本次修改文件，优先最小范围
- **规则文件版本化**：初始化到 `.agent/**` 的受管文件必须带版本号，版本不一致时强制更新

## 规则索引

| 文件 | 说明 |
| ---- | ---- |
| `SKILL.md`                | skill 入口与路由规则              |
| `README.md`               | skill 规则总览                    |
| `template/AGENTS.md` | 项目根文档渐进式模板，init 会创建或更新 `AGENTS.md` |
| `template/CLAUDE.md` | 项目根文档渐进式模板，init 会创建或更新 `CLAUDE.md` |
| `template/scripts/lint.md` | 项目侧 lint SOP 模板              |
| `comment.md`              | 注释规范                          |
| `naming.md`               | 命名规范                          |
| `constant.md`             | 常量与枚举规范                    |
| `api.md`                  | 接口与类型规范                    |
| `template/index/constants.json` | 常量索引模板                      |
| `template/index/utils.json` | 公共方法索引模板                  |
| `vue.md`                  | Vue 组件规范                      |
| `unocss.md`               | UnoCSS 样式规范                   |
| `template/admin/rules.md` | 后台管理总规则                    |
| `template/admin/modal.md` | 弹窗模板                          |
| `template/admin/table.md` | 表格模板                          |
| `template/tauri/rules.md` | Tauri 规则                        |
| `template/uni/rules.md` | UniApp 规则                       |

## 配套命令

| 命令       | 说明                                                |
| ---------- | --------------------------------------------------- |
| `/am:init` | 初始化 `AGENTS.md`、`CLAUDE.md`、`.agent/api.md`、`.agent/comment.md`、`.agent/naming.md`、`.agent/index/**`、`.agent/scripts/lint.md`，并按项目类型包含 `admin/tauri/uni` |
| `/am:api`  | 新增接口、类型与枚举                                |
| `/am:requirement` | 根据产品 prompt 生成 `.agent/ui/{feature-name}/` 需求文档包 |
| `/am:design` | 根据 `.agent/ui/{feature-name}/` 需求文档生成 Pencil UI 设计稿 |
| `/am:archive` | 将关键功能点、页面和模块归档到 `.agent/archive/`，并同步维护项目 `AGENTS.md` 的项目级规则表 |
| `/am:session` | 提取当前会话信息，并输出到 `.agent/archive/sessions/` |
| `/am:review` | 按 Aimin 与阿里风格 review 当前代码，输出问题与优化建议 |
| `/am:update` | 按版本升级 `.agent/**`，并只更新 `AGENTS.md` 的 `# Aimin-skill` 段落 |

## 项目级规则表

`/am:archive` 会同步更新目标项目 `AGENTS.md` 的项目级规则表，固定列为：

| 修改范围 | 对应归档文档 | 读取要求 | 备注 |
| ---- | ---- | ---- | ---- |
| 订单详情页 | `.agent/archive/order-detail.md` | 修改前必读 | 先读文档和 prompt 再改代码 |
