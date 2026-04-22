# .agent 使用指南

本项目 `.agent/` 目录保存详细规范；根目录 `AGENTS.md` 与 `CLAUDE.md` 只负责路由和边界说明，不直接展开全部细节。

## 使用顺序

1. 先读根目录 `AGENTS.md` 或 `CLAUDE.md`
2. 命中具体场景后，再进入 `.agent/**` 深读
3. 优先参考项目内现有代码实现，避免脱离上下文套模板

## 项目配置

- **类型**：{type}
- **框架**：{framework}
- **语言**：{language}
- **UI 库**：{ui}
- **样式**：{style}
- **构建**：{build}
- **状态管理**：{state}

## 场景路由

| 场景 | 文件 | 说明 |
| ---- | ---- | ---- |
| 接口新增、接口更新 | `.agent/api.md` | 接口目录、类型命名、枚举协同 |
| 系统常量、枚举维护 | `.agent/index/constants.json` | 常量索引与文件位置 |
| 公共方法、工具函数 | `.agent/index/utils.json` | 公共方法索引与用途 |
| 命名、代码顺序 | `.agent/naming.md` | 通用命名与代码组织规范 |
| lint、交付收尾 | `.agent/scripts/lint.md` | 收尾检查与交付清单 |

如果是 admin 项目，补充查看 `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md`。

## 目录结构

```text
.agent/
├── README.md
├── naming.md
├── constant.md
├── api.md
├── index/
│   ├── constants.json
│   └── utils.json
├── scripts/
│   └── lint.md
├── admin/
├── tauri/
└── uni/
```
