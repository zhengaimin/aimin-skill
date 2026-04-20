# .agent README 模板

初始化项目时，根据识别的项目配置生成此文件。

## 模板

```markdown
# .agent 使用指南

本项目 `.agent/` 目录存放所有开发规范与模板，AI 辅助生成代码时以此为约束。

## 项目配置

- **类型**：{type}
- **框架**：{framework}
- **语言**：{language}
- **UI 库**：{ui}
- **样式**：{style}
- **构建**：{build}
- **状态管理**：{state}

## 项目约束（强制）

- 不要过度封装，优先保持实现直接、可读
- 命名简单化，优先短而清晰的命名
- 禁止无语义缩写（如 `a1`、`tmp2`、`xx`）
- 常见缩写需注释（`cfg`、`ctx`、`ref` 等）

## 目录结构

```text
.agent/
├── README.md              # 本文件
├── naming.md              # 命名规范
├── api.md                 # 接口规范
├── constant.md            # 常量规范
├── vue.md                 # Vue 规范
├── unocss.md              # UnoCSS 规范（有 unocss 时）
├── command/               # 命令说明
├── {type}/                # 项目类型规则
└── index/                 # 索引文件
```

## 命令

| 命令     | 说明       |
| -------- | ---------- |
| `--init` | 初始化项目 |
| `--api`  | 新增接口   |
```

---

## 初始化时填充变量

| 变量        | 来源                                |
| ----------- | ----------------------------------- |
| `{type}`    | 项目类型识别结果                    |
| `{framework}` | package.json 中的 vue/react 等    |
| `{language}`  | 是否有 tsconfig.json              |
| `{ui}`      | element-plus/antd/vant 等          |
| `{style}`   | unocss/tailwindcss/scss 等         |
| `{build}`   | vite/webpack 等                    |
| `{state}`   | pinia/vuex/redux 等                |