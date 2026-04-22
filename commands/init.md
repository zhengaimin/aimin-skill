## 目标

`/am:init` 用来初始化项目根目录 `AGENTS.md`、`CLAUDE.md` 与 `.agent/` 规范目录，让规则保持“默认轻量、命中场景再深读”的渐进式披露结构。

## 执行原则

1. 先检查仓库现状与技术栈，再增量创建或更新文件。
2. `AGENTS.md` 与 `CLAUDE.md` 只保留工作方式、边界和路由表，不要把全部规范直接堆进去。
3. 详细规则全部下沉到 `.agent/**`，命中对应场景时再展开读取。
4. 如果项目里已有相关文件，只做增量更新，不要覆盖用户已有的业务约定。

## 必建文件

- `AGENTS.md`
- `CLAUDE.md`
- `.agent/README.md`
- `.agent/naming.md`
- `.agent/constant.md`
- `.agent/api.md`
- `.agent/index/constants.json`
- `.agent/index/utils.json`
- `.agent/scripts/lint.md`

## 路由表要求

在 `AGENTS.md` 与 `CLAUDE.md` 都输出一个表格，至少包含以下映射：

| 场景 | 读取文件 | 说明 |
| ---- | -------- | ---- |
| 接口新增、接口更新 | `.agent/api.md` | 接口目录、类型命名、枚举协同 |
| 系统常量、枚举维护 | `.agent/index/constants.json` | 常量索引、文件位置、枚举值摘要 |
| 公共方法、工具函数 | `.agent/index/utils.json` | 公共方法索引、用途、文件位置 |
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

`.agent/scripts/lint.md` 默认按 `.agent/naming.md` 做收尾检查。

如果识别为 admin 项目，需要额外加入：

- 删除未使用变量
- 删除未使用导入
- 删除未使用参数或无意义的占位变量

## 输出要求

`.agent/README.md` 需要补充：

- 项目类型
- 技术栈摘要
- 路由表摘要
- `.agent` 目录结构
- 使用顺序说明
