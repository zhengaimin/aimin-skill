## 目标

`/am:init` 用来初始化项目根目录 `AGENTS.md`、`CLAUDE.md`、`.gitignore` 与最小化的 `.agent/` 规范目录，让规则保持“默认轻量、命中场景再深读”的渐进式披露结构。

## 执行原则

1. 先检查仓库现状与技术栈，再增量创建或更新文件。
2. 初始化时，增量维护根目录 `.gitignore`，确保包含 AI 规则忽略区块且不重复追加。
3. `AGENTS.md` 与 `CLAUDE.md` 只保留工作方式、边界和路由表，不要把全部规范直接堆进去。
4. 项目自有 `.agent` 文件只保留项目索引与收尾脚本；通用规则优先使用系统已安装参考的软链接。
5. 如果项目里已有相关文件，只做增量更新，不要覆盖用户已有的业务约定。
6. 除项目索引与收尾脚本外，禁止创建额外的项目侧 `.agent/**` 普通文件；误创建时必须删除并改成软链接。

## 项目自有文件

- `.gitignore`
- `AGENTS.md`
- `CLAUDE.md`
- `.agent/index/constants.json`
- `.agent/index/utils.json`
- `.agent/scripts/lint.md`

除这些文件外，项目里不应新增其他 `.agent/**` 普通文件。

## `.gitignore` 要求

初始化时确保 `.gitignore` 至少包含以下内容，并且整个区块只保留一份：

```gitignore
# ai
.agent
AGENTS.md
CLAUDE.md
```

## 共享规则软链接

以下通用规则不要复制到项目里，优先软链接到系统已安装的 `aimin-skill` 参考文件，并视为只读：

- `.agent/comment.md`
- `.agent/naming.md`
- `.agent/constant.md`
- `.agent/api.md`

按技术栈命中后再追加：

- `.agent/vue.md`
- `.agent/unocss.md`
- `.agent/admin/rules.md`
- `.agent/admin/table.md`
- `.agent/admin/modal.md`
- `.agent/tauri/rules.md`
- `.agent/uni/rules.md`

这些共享软链接只用于读取规则，不要在项目里直接改写它们。

即使识别到 Tauri、React、Vue、admin、uni 等技术栈，也不要生成项目定制版 `.agent/naming.md`、`.agent/constant.md`、`.agent/api.md`、`.agent/tauri/rules.md` 等普通文件；仍然优先使用共享软链接。

创建这些共享规则软链接时需要按平台处理：

- macOS / Linux：优先使用 `ln -sfn <参考路径> <项目路径>`，必要时先创建父目录或删除旧文件
- Windows：优先使用 PowerShell `New-Item -ItemType SymbolicLink -Path <项目路径> -Target <参考路径> -Force`
- Windows：如果目标已存在，先 `Remove-Item -Force` 再创建 SymbolicLink
- Windows：这里主要是文件链接，不要用目录 Junction 代替文件软链接
- Windows：如果因 Developer Mode 未开启或权限不足导致 SymbolicLink 失败，要明确说明阻塞，不要静默复制文件替代

## 硬性验收

初始化完成前必须满足：

- `.agent/README.md` 不存在
- `.agent/comment.md`、`.agent/naming.md`、`.agent/constant.md`、`.agent/api.md` 如果存在，必须是软链接
- `.agent/vue.md`、`.agent/unocss.md`、`.agent/admin/*.md`、`.agent/tauri/rules.md`、`.agent/uni/rules.md` 如果存在，必须是软链接
- 如果误创建了上述普通文件，先删除，再按平台规则重建软链接
- 如果软链接无法创建，要明确报阻塞，不能复制文件替代

## 路由表要求

在 `AGENTS.md` 与 `CLAUDE.md` 都输出一个表格，至少包含以下映射：

| 场景 | 读取文件 | 说明 |
| ---- | -------- | ---- |
| 接口新增、接口更新 | `.agent/api.md` | 接口目录、类型命名、枚举协同 |
| 系统常量、枚举维护 | `.agent/index/constants.json` | 常量索引、文件位置、枚举值摘要 |
| 公共方法、工具函数 | `.agent/index/utils.json` | 公共方法索引、用途、文件位置 |
| 注释规范 | `.agent/comment.md` | 注释语言、格式与使用边界 |
| 命名、代码顺序 | `.agent/naming.md` | 通用命名与代码组织规范 |
| lint、交付收尾 | `.agent/scripts/lint.md` | 收尾检查与交付前清单 |

如果识别为 admin 项目，再追加：

| 场景 | 读取文件 | 说明 |
| ---- | -------- | ---- |
| admin 页面、表格、弹窗 | `.agent/admin/rules.md` | admin 专用规则 |

如果识别为 tauri 或 uni 项目，也要补对应规则入口。

## 索引文件要求

`.agent/index/constants.json` 至少维护：

- `name`
- `description`
- `typeName`
- `filePath`
- `values`
- `lastUpdated`

`.agent/index/utils.json` 至少维护：

- `name`
- `description`
- `filePath`
- `keywords`
- `lastUpdated`

## lint 要求

`.agent/scripts/lint.md` 默认按 `.agent/naming.md` 与 `.agent/comment.md` 做收尾检查。

代码有修改时，`.agent/scripts/lint.md` 需要求对本次修改文件执行 lint 校验，优先按文件路径或最小范围运行，不默认全量 lint。

非 admin 项目，不要把 admin 专属检查写进 `.agent/scripts/lint.md`。

如果识别为 admin 项目，才额外写入：

- 删除未使用变量
- 删除未使用导入
- 删除未使用参数或无意义的占位变量
- 如果出现 `error  Insert \`␍\`  prettier/prettier`，优先检查并统一 CRLF / LF 行尾

## 输出要求

输出结果里需要明确：

- 项目自有文件与共享软链接的边界
- `.gitignore` 已补充 AI 忽略区块
- `.agent/index/**` 与 `.agent/scripts/lint.md` 的用途
- 明确说明 `.agent/README.md` 未创建，且共享规则没有落成项目普通文件
