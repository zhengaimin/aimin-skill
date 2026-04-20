# 命令：`--init` 初始化

分析项目类型与技术栈，初始化 `.agent` 目录结构。

## 1. 识别项目类型

通过以下特征判断：

| 类型   | 判断条件                                      |
| ------ | --------------------------------------------- |
| admin  | `package.json` 有 `element-plus` 或 `antd`    |
| tauri  | 有 `src-tauri/` 目录或 `tauri` 依赖           |
| uni    | 有 `pages.json` 或 `uniapp`/`@dcloudio` 依赖  |
| web    | 无上述特征，纯前端项目                        |

## 2. 识别技术栈

检查 `package.json` 的 `dependencies` 和 `devDependencies`：

| 类别     | 检查项                                          |
| -------- | ----------------------------------------------- |
| 框架     | `vue`、`react`、`svelte`                        |
| 语言     | `typescript`（有 `tsconfig.json`）              |
| UI 库    | `element-plus`、`antd`、`vant`、`uview`         |
| 样式     | `unocss`、`tailwindcss`、`sass`、`less`         |
| 构建     | `vite`、`webpack`、`rspack`                     |
| 状态管理 | `pinia`、`vuex`、`redux`、`zustand`             |

## 3. 项目约束（强制）

- **不要过度封装**：优先保持实现直接、可读
- **命名简单化**：优先短而清晰的命名，避免冗长命名链
- **禁止无语义缩写**：如 `a1`、`tmp2`、`xx`
- **常见缩写需注释**：`cfg`、`ctx`、`ref` 等需补中文注释

## 4. 初始化步骤

### 4.1 创建目录结构

```text
.agent/
├── README.md              # 入口 & 命令索引
├── naming.md              # 命名规范（通用）
├── constant.md            # 常量与枚举规范
├── api.md                 # 接口与类型规范
├── vue.md                 # Vue 组件规范（vue 项目）
├── unocss.md              # UnoCSS 样式规范（有 unocss 时）
├── command/               # 命令详细说明
│   └── api.md             # --api 命令
├── {type}/                 # 项目类型专用规则
│   ├── rules.md           # 总规则
│   └── ...                 # 其他模板
└── index/                 # 索引文件
    └── constants.json     # 常量索引（空模板）
```

### 4.2 按项目类型加载规则

- **admin**：加载 `admin/rules.md`、`admin/modal.md`、`admin/table.md`
- **tauri**：加载 `tauri/rules.md`（如有）
- **uni**：加载 `uni/rules.md`（如有）
- **web**：加载基础规则

### 4.3 精简索引文件

`index/constants.json` 初始状态：
```json
{
  "description": "常量索引",
  "constants": []
}
```

## 5. 输出项目配置

初始化完成后，在 `.agent/README.md` 中输出项目配置摘要：

```markdown
## 项目配置

- **类型**：admin
- **框架**：Vue 3
- **语言**：TypeScript
- **UI 库**：Element Plus
- **样式**：UnoCSS + SCSS
- **构建**：Vite
- **状态管理**：Pinia

## 项目约束

- 不要过度封装，优先保持实现直接、可读
- 命名简单化，优先短而清晰的命名
```

## 6. 更新 CLAUDE.md

在项目根目录 `CLAUDE.md` 中添加：

```markdown
请先阅读 .agent/README.md 了解开发规范。
```