# am-archive 归档规则

| 项目 | 内容 |
| --- | --- |
| 来源 | 2026-05-20 修复 aimin-skill 归档目录混用问题 |
| 目标 | 统一关键功能、页面和会话归档目录，避免 `.agent/` 与 `.agents/` 混用 |

## 关键结论

| 类别 | 内容 | 备注 |
| --- | --- | --- |
| 目录规范 | 关键功能、页面、模块归档统一使用 `.agent/archive/` | 不再使用 `.agents/archive/` |
| 文件落点 | 功能点和页面归档直接使用稳定主题文件，如 `.agent/archive/order-detail.md` | 不再使用 `features/`、`pages/` 子目录 |
| 会话归档 | 会话归档输出到 `.agent/archive/sessions/` | `/am:session` 与 `$am-session` 同步更新 |
| 原始资料 | 客户、后台、产品方原始资料统一放 `.agent/docs/` | 归档结果不要写入 docs |

## 涉及文件或模块

| 路径或模块 | 作用 | 修改前是否必读 |
| --- | --- | --- |
| `commands/archive.md` | `/am:archive` 命令规则源 | 是 |
| `commands/session.md` | `/am:session` 命令规则源 | 是 |
| `skills/SKILL.md` | skill 入口与路由规则 | 是 |
| `skills/README.md` | 规则总览 | 是 |
| `src/cli/templates.js` | 安装产物模板生成 | 是 |
| `README.md` | 仓库使用文档 | 按需 |

## 本次变更

| 类型 | 内容 | 影响 |
| --- | --- | --- |
| 路径统一 | 将规则、README、模板生成中的归档路径统一为 `.agent/archive/` | 安装后的 Claude/Codex 命令不再提示旧目录 |
| 版本同步 | `skills/SKILL.md`、`skills/README.md`、`skills/template/AGENTS.md` 版本号升为 `0.1.4` | 符合 `skills/**/*.md` 修改必须同步版本号规则 |
| 生成逻辑 | Codex user skill 参数说明改为模板内显式生成 | 避免依赖固定字符串替换 |

## 待确认事项

| 事项 | 原因 | 当前状态 |
| --- | --- | --- |
| 是否迁移既有项目中的 `.agents/archive/**` 旧文件 | 本仓库没有旧归档目录，无法判断外部项目存量 | 待具体项目处理 |
