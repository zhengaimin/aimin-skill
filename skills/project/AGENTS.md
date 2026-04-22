# AGENTS

本项目采用渐进式披露：默认只读本文件和 `.agent/README.md`，命中具体任务后再进入对应的 `.agent/**` 文件。

## 工作方式

- 先检查当前代码与目录，不要默认预读全部规范
- 详细规则下沉到 `.agent/**`
- 项目侧规则优先级高于通用模板

## 路由表

| 场景 | 读取文件 | 说明 |
| ---- | -------- | ---- |
| 接口新增、接口更新 | `.agent/api.md` | 接口目录、类型命名、枚举协同 |
| 系统常量、枚举维护 | `.agent/index/constants.json` | 常量索引、文件位置、枚举值摘要 |
| 公共方法、工具函数 | `.agent/index/utils.json` | 公共方法索引、用途、文件位置 |
| 命名、代码顺序 | `.agent/naming.md` | 通用命名与代码组织规范 |
| lint、交付收尾 | `.agent/scripts/lint.md` | 收尾检查与交付前清单 |

如果是 admin 项目，再读取 `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md`。
