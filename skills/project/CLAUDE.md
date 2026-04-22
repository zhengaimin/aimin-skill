# CLAUDE

本项目使用渐进式披露：默认先读本文件与 `.agent/README.md`，仅在命中对应任务时再深读 `.agent/**`。

## 执行边界

- 先理解现有代码，再决定要打开哪些规则文件
- 根目录文档只保留入口与路由，不重复展开详细规范
- 项目里已有约定时，优先遵守项目侧文件

## 路由表

| 场景 | 读取文件 | 说明 |
| ---- | -------- | ---- |
| 接口新增、接口更新 | `.agent/api.md` | 接口目录、类型命名、枚举协同 |
| 系统常量、枚举维护 | `.agent/index/constants.json` | 常量索引、文件位置、枚举值摘要 |
| 公共方法、工具函数 | `.agent/index/utils.json` | 公共方法索引、用途、文件位置 |
| 命名、代码顺序 | `.agent/naming.md` | 通用命名与代码组织规范 |
| lint、交付收尾 | `.agent/scripts/lint.md` | 收尾检查与交付前清单 |

如果是 admin 项目，再读取 `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md`。
