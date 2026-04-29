# 目标

`/am:api` 按项目侧 `.agent/api.md` 为准新增或更新接口、类型、枚举，并同步维护索引文件。

## 执行顺序

1. 先检查当前仓库，再读取 `AGENTS.md`、`CLAUDE.md` 与命中的 `.agent/**` 规则文件。
2. 命中接口任务后，再读取 `.agent/api.md`。
3. 如果涉及枚举或常量，读取 `.agent/index/constants.json`。
4. 如果涉及公共方法复用、工具函数抽离或调用链路，读取 `.agent/index/utils.json`。
5. 项目侧文档缺失时，再回退到安装包里的默认规范。

## 实现要求

1. 先确定真实的接口模块目录，再新增类型与请求函数。
2. 请求函数命名继续遵循 `[httpMethod][Action]Api`。
3. 请求与响应类型继续遵循 `Req[HttpMethod][Action][Feature]Api` 与 `Res[HttpMethod][Action][Feature]Api`。
4. 接口里出现枚举字段时，优先引用项目已有枚举值类型；若不存在，再新增常量并同步索引。
5. `.agent/api.md`、`.agent/comment.md`、`.agent/constant.md`、`.agent/naming.md` 等规则文件默认只读，不要在接口任务里改写它们。

## 索引维护

如果新增或更新了枚举：

- 更新 `.agent/index/constants.json`
- 同名条目优先做更新，不重复追加
- 回填 `lastUpdated`

如果新增或更新了公共方法：

- 更新 `.agent/index/utils.json`
- 写清 `name`、`description`、`filePath`、`keywords`
- 回填 `lastUpdated`
