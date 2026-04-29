<!-- aimin-skill-version: 0.1.0 -->

# 命名规范

## 通用命名偏好

- 开发者偏好更简洁的命名：优先短而明确，避免冗长命名链。
- 简洁命名必须可读：禁止无语义缩写（如 `a1`、`tmp2`、`xx`）。
- 常见短名/缩写的注释要求统一参考 `.agent/comment.md`。

---

## 常量命名

### TYPE 常量

- 格式：`UPPERCASE_SNAKE_CASE`
- 示例：`SEARCH_TYPE`、`PAYMENT_STATUS`

### TypeScript 类型

- 格式：`T + PascalCase`
- 示例：`TSearchType`、`TPaymentStatus`

### I18N 映射

- 格式：`[TYPE_NAME]_I18N`
- 示例：`SEARCH_TYPE_I18N`、`PAYMENT_STATUS_I18N`

### OPTIONS 列表

- 格式：`[TYPE_NAME]_OPTIONS`
- 示例：`SEARCH_TYPE_OPTIONS`、`PAYMENT_STATUS_OPTIONS`

### CONFIGS 映射

- 格式：`[TYPE_NAME]_CONFIGS`
- 示例：`REFUND_STATUS_CONFIGS`、`PACKAGE_STATUS_CONFIGS`

---

## 事件处理函数命名

所有事件处理函数必须以 `handle` 开头，采用驼峰命名法。

### 格式

```text
handle + 动作 + 对象
```

### 正确示例

```typescript
function handleClick() {}
function handleSubmit() {}
function handleBack() {}
function handleInputChange() {}
function handleSelectAmount() {}
function handleConfirmRecharge() {}
function handleLoginSuccess() {}
function handleLoginFail() {}
```

### 错误示例

```typescript
// 以下命名方式不符合规范
function click() {}
function submit() {}
function goBack() {}
function onInputChange() {}
function selectAmount() {}
function onLoginSuccess() {}
```

---

## 代码顺序规范

适用于 `.vue` 文件（`<script setup>`），包括 Vue / Admin / UniApp 场景。

### 通用要求

- **每个部分内的方法/变量都不要空行**，保持连续编排，例如：`axiosXXX1` 与 `axiosXXX2` 之间不换行。
- **handle 方法之间禁止空行**，保持连续编排。
- **视图类型集中管理（强制）**：`src/views/**` 内页面级 TypeScript 类型统一放同级 `types.ts`；`.vue` 文件内禁止新增页面级 `type` / `interface` 声明。
- **页面常量集中管理（强制）**：页面级常量仅在属于枚举/映射类复用配置时（如 `OPTIONS`、`STATUS`、`TYPE`、`ENUM`、`MAP` 及其 `I18N` / `CONFIGS`）统一放同级 `constants.ts`；布局尺寸、提示文案、轻量默认值、一次性表单初始值默认留在页面内；通用纯函数、payload 构建、格式化/转换方法统一放 `utils/`；不要新增 `config.ts`；页面入口仅保留编排逻辑与必要局部配置。
- 注释规范统一参考 `.agent/comment.md`。
- **变量与方法强制分组**：变量按 `useXXX Hook 调用 -> ref/reactive -> computed`；方法按 `通用方法 -> axios*Api -> handle* -> on* 生命周期 -> watch/watchEffect`。
- **分组空行规则（强制）**：分组之间保留一个空行；分组内部连续排列且禁止空行；禁止跨分组穿插声明。
- **弹窗特例**：`acceptParams` 固定放在 `watch/watchEffect` 前。
- **善于提取常量**：页面允许保留局部布局值、提示文案、轻量默认值、一次性表单初始值，复用型枚举/映射类常量再抽到 `constants.ts`。

### 自动检查命令

- 检查 `<script setup>` 顶层分组顺序与空行规则：

```bash
node .agent/script/check-vue-script-groups.mjs src/views/organizationChart/enterpriseSetup/addProcesses
```

- 支持直接传文件或目录，命中目录时会递归检查其中的 `.vue` 文件。
- 规则范围：分组顺序、分组间必须 1 个空行、组内禁止空行。

### 推荐顺序

1. **类型定义导入**（`import type`）
2. **Vue 相关函数**
3. **接口函数**
4. **组件**
5. **常量**
6. **Hooks**
7. **Store**
8. **本地数据/组件**
9. **组件选项配置**（`defineOptions`）
10. **ts 类型定义**（`type`、`interface`）
11. **useXXX Hook 函数调用**（同区域内不换行）
12. **ref、reactive 响应式数据**（同区域内不换行）
13. **computed 计算属性**（同区域内不换行）
14. **Methods 方法定义**（通用方法函数，同区域内不换行）
15. **axios 接口请求函数**（与后端 API 交互的函数，同区域内不换行）
16. **handle 事件处理函数**（用户交互事件处理，同区域内不换行）
17. **acceptParams 接收参数方法**（弹窗组件必备，放在 watch 前）
18. **生命周期钩子**（`onShow`、`onLoginSuccess`、`onLoginFail` 等，同区域内不换行）
19. **watch 监听**（`watch` / `watchEffect`，同区域内不换行）
20. **defineExpose**（仅在需要时使用，放在最后）
