# AGENTS

本项目采用渐进式披露：默认只读本文件，命中具体任务后再进入对应的 `.agent/**` 文件。

## 工作方式

- 先检查当前代码与目录，不要默认预读全部规范
- 不要基于有限上下文做过度判断或过度设计，优先保证代码可读性、轻量和易维护性
- 生成涉及第三方库、框架、SDK、依赖 API 的代码前，先自动使用 Context7 MCP 查询对应依赖的最新文档，无需等待用户明确要求
- 会话中只要修改了代码，收尾前必须使用 lint 对本次修改文件做校验；优先按文件路径或最小范围执行，不默认全量 lint
- `.agent/index/**` 与 `.agent/scripts/lint.md` 是项目自有文件
- `.agent/comment.md`、`.agent/naming.md`、`.agent/constant.md`、`.agent/api.md` 以及技术栈规则通常是指向系统安装参考的软链接，默认只读，不直接修改
- `.agent/README.md` 不应创建；如果出现，说明初始化结果不符合约束
- 详细规则下沉到 `.agent/**`
- 项目侧规则优先级高于通用模板

## 路由表

| 场景 | 读取文件 | 说明 |
| ---- | -------- | ---- |
| 接口新增、接口更新 | `.agent/api.md` | 接口目录、类型命名、枚举协同 |
| 系统常量、枚举维护 | `.agent/index/constants.json` | 常量索引、文件位置、枚举值摘要 |
| 公共方法、工具函数 | `.agent/index/utils.json` | 公共方法索引、用途、文件位置 |
| 注释规范 | `.agent/comment.md` | 注释语言、格式与使用边界 |
| 命名、代码顺序 | `.agent/naming.md` | 通用命名与代码组织规范 |
| lint、交付收尾 | `.agent/scripts/lint.md` | 收尾检查与交付前清单 |

如果是 admin 项目，再读取 `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md`。
