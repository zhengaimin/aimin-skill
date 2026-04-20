# Vue 开发规范

> 命名规范：通用规范统一参考 `.agent/naming.md`，本文仅补充 Vue 开发相关规则。

## 文件结构规范

1. **必须支持 TypeScript**：所有 Vue 组件的 `<script>` 必须使用 `lang="ts"`。
2. **标签顺序固定**：Vue 文件中 `<script>` 必须放在最上面，然后才是 `<template>`。

## Props 定义规范

### 1. 使用 `defineProps` + `withDefaults`

在定义组件 props 时，应优先使用 TypeScript 接口配合 `defineProps` 和 `withDefaults` 的方式，而不是使用对象字面量方式。

**❌ 不推荐：**

```vue
<script setup>
defineProps({
  formList: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
</script>
```

**✅ 推荐：**

```vue
<script setup lang="ts">
interface Props {
  formList?: any[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  formList: () => [],
  disabled: false
});
</script>
```

**优势：**

- 提供更好的类型推断和类型检查
- 代码更简洁清晰
- 符合 Vue 3 Composition API 最佳实践
- IDE 支持更好（自动补全、重构等）

## 双向绑定规范

### 2. 使用 `defineModel` 实现双向绑定

对于需要双向绑定的 prop，应使用 Vue 3.4+ 引入的 `defineModel` 宏，而不是手动定义 `modelValue` prop 和 `update:modelValue` 事件。

**❌ 不推荐：**

```vue
<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:modelValue"]);

// 更新模型值
function updateValue(newValue) {
  emit("update:modelValue", newValue);
}
</script>
```

**✅ 推荐：**

```vue
<script setup lang="ts">
// 基础用法
const modelValue = defineModel<Record<string, any>>({ default: () => ({}) });

// 多个 v-model
const title = defineModel<string>("title", { default: "" });
const content = defineModel<string>("content", { default: "" });
</script>

<template>
  <!-- 直接使用，自动支持双向绑定 -->
  <input v-model="modelValue.name" />
</template>
```

**优势：**

- 自动处理 `modelValue` prop 和 `update:modelValue` 事件
- 减少模板代码，提升可维护性
- 类型安全，支持泛型约束
- 支持多个 v-model（命名模型）

## 最佳实践示例

### 完整组件示例

```vue
<template>
  <div class="form-box" v-if="processedFormList.length > 0">
    <div v-for="item in processedFormList" :key="item.id">
      <el-form-item :label="item.label">
        <el-input v-if="item.type === 'input'" v-model="modelValue[item.key]" :disabled="disabled" />
        <el-select v-else-if="item.type === 'select'" v-model="modelValue[item.key]" :disabled="disabled">
          <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Props 接口定义
interface FormItem {
  id: string;
  key: string;
  label: string;
  type: "input" | "select";
  options?: Array<{ label: string; value: any }>;
}

interface Props {
  formList?: FormItem[];
  disabled?: boolean;
}

// 使用 withDefaults 设置默认值
const props = withDefaults(defineProps<Props>(), {
  formList: () => [],
  disabled: false
});

// 使用 defineModel 实现双向绑定
const modelValue = defineModel<Record<string, any>>({
  default: () => ({})
});

// 计算属性处理数据
const processedFormList = computed(() => {
  return props.formList.map(item => ({
    ...item
    // 添加额外处理逻辑
  }));
});
</script>
```

## 注意事项

1. **TypeScript 支持**：确保在 `<script>` 标签中添加 `lang="ts"` 属性
2. **可选属性**：Props 接口中的属性应标记为可选（`?`），默认值在 `withDefaults` 中设置
3. **类型约束**：尽可能提供具体的类型定义，避免使用 `any`
4. **默认值**：对象和数组的默认值必须使用工厂函数返回
5. **defineModel 版本**：`defineModel` 需要 Vue 3.4.0 或更高版本

## 迁移指南

### 从旧语法迁移到新语法

**步骤 1**：将 props 定义转换为接口

```typescript
// 旧
defineProps({
  list: { type: Array, default: () => [] }
});

// 新
interface Props {
  list?: any[];
}
withDefaults(defineProps<Props>(), {
  list: () => []
});
```

**步骤 2**：将 modelValue 转换为 defineModel

```typescript
// 旧
const props = defineProps({ modelValue: Object });
const emit = defineEmits(["update:modelValue"]);

// 新
const modelValue = defineModel<Record<string, any>>();
```

**步骤 3**：更新模板中的事件绑定

```vue
<!-- 旧 -->
<input :value="modelValue" @input="emit('update:modelValue', $event.target.value)" />

<!-- 新 -->
<input v-model="modelValue" />
```

## UnoCSS 样式规范

> 已拆分到 `.agent/admin/unocss.md`，命中 UnoCSS/Tailwind 样式改动时按需加载。

## 事件处理规范

### 4. 点击事件命名规范

在 Vue 组件中，所有点击事件处理函数都应该以 `handle` 开头，以提高代码的可读性和一致性。

**❌ 不推荐：**

```vue
<template>
  <button @click="submitForm">提交</button>
  <button @click="cancel">取消</button>
  <button @click="toggleVisible">切换显示</button>
</template>

<script setup lang="ts">
function submitForm() {
  // 提交表单逻辑
}

function cancel() {
  // 取消逻辑
}

function toggleVisible() {
  // 切换显示逻辑
}
</script>
```

**✅ 推荐：**

```vue
<template>
  <button @click="handleSubmit">提交</button>
  <button @click="handleCancel">取消</button>
  <button @click="handleToggleVisible">切换显示</button>
</template>

<script setup lang="ts">
// 处理表单提交
function handleSubmit() {
  // 提交表单逻辑
}

// 处理取消操作
function handleCancel() {
  // 取消逻辑
}

// 处理显示状态切换
function handleToggleVisible() {
  // 切换显示逻辑
}
</script>
```

**优势：**

- 提高代码可读性，一眼就能识别出这是事件处理函数
- 统一命名规范，便于团队协作和代码维护
- 避免与普通函数命名混淆
- 在 IDE 中更容易通过搜索找到所有事件处理函数

**命名建议：**

- 点击事件：`handleClick`、`handleSubmit`、`handleDelete`
- 切换事件：`handleToggle`、`handleSwitch`
- 选择事件：`handleSelect`、`handleChoose`
- 其他事件：`handleInputChange`、`handleScroll`

**注意事项：**

1. **一致性**：整个项目中所有点击事件处理函数都应遵循此规范
2. **语义化**：函数名应清楚表达事件处理的具体行为
3. **简洁性**：在保持语义清晰的前提下，函数名尽量简洁
4. **扩展性**：对于复杂的事件处理，可以适当增加描述性词汇，如 `handleFormSubmit`、`handleDataLoad`

**迁移指南：**

**步骤 1**：识别现有代码中的事件处理函数

```vue
<!-- 旧代码 -->
<template>
  <button @click="saveData">保存</button>
</template>

<script setup lang="ts">
function saveData() {
  // 保存逻辑
}
</script>
```

**步骤 2**：重命名事件处理函数

```vue
<!-- 新代码 -->
<template>
  <button @click="handleSaveData">保存</button>
</template>

<script setup lang="ts">
function handleSaveData() {
  // 保存逻辑
}
</script>
```

**步骤 3**：更新所有相关的引用

确保在模板、计算属性、其他函数中所有对该函数的引用都更新为新的名称。

## TypeScript 使用规范

### 5. TypeScript 类型定义规范

在 Vue 组件中使用 TypeScript 时，应遵循以下类型定义规范，以确保代码的类型安全性和可维护性。

#### 5.1 接口定义规范

**❌ 不推荐：**

```typescript
// 使用 any 类型
const formData = ref<any>({});

// 类型定义不明确
interface User {
  name: string;
  age: any;
  data: Object;
}
```

**✅ 推荐：**

```typescript
// 明确定义类型
interface FormField {
  id: string;
  label: string;
  value: string | number;
  required?: boolean;
}

const formData = ref<Record<string, FormField>>({});

// 明确的类型定义
interface User {
  name: string;
  age: number;
  data: {
    address: string;
    phone: string;
  };
}
```

#### 5.2 Props 类型定义规范

**❌ 不推荐：**

```typescript
// 使用 any 类型
defineProps({
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  }
});

// 类型定义不完整
interface Props {
  userList: any[];
  config: Object;
}
```

**✅ 推荐：**

```typescript
// 明确定义数组元素类型
interface User {
  id: string;
  name: string;
  email: string;
}

interface Config {
  theme: "light" | "dark";
  language: "zh" | "en";
}

interface Props {
  userList?: User[];
  config?: Config;
}

const props = withDefaults(defineProps<Props>(), {
  userList: () => [],
  config: () => ({
    theme: "light",
    language: "zh"
  })
});
```

#### 5.3 事件处理函数类型定义

**❌ 不推荐：**

```typescript
// 缺少参数类型
function handleInputChange(event) {
  console.log(event.target.value);
}

// 使用 any 类型
async function handleSubmit(data: any) {
  // 处理提交逻辑
}
```

**✅ 推荐：**

```typescript
// 明确定义事件类型
// 处理输入变化事件
function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  console.log(target.value);
}

// 定义自定义数据类型
interface SubmitData {
  name: string;
  email: string;
  phone: string;
}

// 处理表单数据提交
async function handleSubmit(data: SubmitData) {
  // 处理提交逻辑
}
```

#### 5.4 API 响应类型定义

**❌ 不推荐：**

```typescript
// 使用 any 类型
async function fetchData() {
  const response = await api.getData();
  const data: any = response.data;
  return data;
}
```

**✅ 推荐：**

```typescript
// 定义 API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

// 获取用户数据
async function fetchData(): Promise<UserInfo> {
  const response = (await api.getData()) as ApiResponse<UserInfo>;
  return response.data;
}
```

#### 5.5 组件内接口调用封装规范

在 Vue 组件中调用 API 接口时，应遵循统一的封装规范，确保代码的一致性和可维护性。

**命名规范：**

- 函数名以 `axios` 开头，后跟接口名称（首字母大写）
- 例如：`axiosGetRoleListApi`、`axiosPostUserApi`、`axiosDeleteOrderApi`

**封装规范：**

1. 使用 `try...catch` 包裹接口调用
2. 在 `try` 中判断 `result.code === 0` 确认接口成功
3. 在 `catch` 中输出方法名称 + 错误信息

**❌ 不推荐：**

```typescript
// 命名不规范，缺少错误处理
async function fetchRoleList() {
  const res = await getRoleListApi();
  roleOptions.value = res.data?.list ?? [];
}

// 没有判断返回码
async function getRoles() {
  try {
    const res = await getRoleListApi();
    roleOptions.value = res.data?.list ?? [];
  } catch (error) {
    console.error(error);
  }
}
```

**✅ 推荐：**

```typescript
import type { Role } from "@/api/interface/modules";
import { getRoleListApi } from "@/api/modules/role";

const roleOptions = ref<Role.IRoleVo[]>([]);

// 获取角色列表
async function axiosGetRoleListApi(): Promise<void> {
  try {
    const result = await getRoleListApi();

    if (result.code === 0) {
      roleOptions.value = result.data?.list ?? [];
    }
  } catch (error) {
    console.error("axiosGetRoleListApi:", error);
  }
}
```

**多参数示例：**

```typescript
import type { User } from "@/api/interface/modules";
import { getUserListApi } from "@/api/modules/user";

const userList = ref<User.IUserVo[]>([]);

// 获取用户列表
async function axiosGetUserListApi(params: User.ReqGetUserListApi): Promise<void> {
  try {
    const result = await getUserListApi(params);

    if (result.code === 0) {
      userList.value = result.data?.list ?? [];
    }
  } catch (error) {
    console.error("axiosGetUserListApi:", error);
  }
}

// 调用示例
await axiosGetUserListApi({ page: 1, page_size: 20 });
```

**带返回值示例：**

```typescript
// 添加用户
async function axiosPostUserApi(params: User.ReqAddUserApi): Promise<boolean> {
  try {
    const result = await postUserApi(params);

    if (result.code === 0) {
      ElMessage.success("添加成功");
      return true;
    }
    return false;
  } catch (error) {
    console.error("axiosPostUserApi:", error);
    return false;
  }
}
```

**优势：**

- 统一的命名规范，便于识别接口调用函数
- 完善的错误处理机制
- 明确的成功判断逻辑
- 便于调试和问题定位

#### 5.6 类型导出规范

**❌ 不推荐：**

```typescript
// 类型定义分散在各个文件中，难以复用
// 在组件A中
interface User {
  id: string;
  name: string;
}

// 在组件B中
interface User {
  id: string;
  name: string;
  email: string; // 字段不一致
}
```

**✅ 推荐：**

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

// 在组件中使用
import type { User } from "@/types/user";

const userList = ref<User[]>([]);
```

**优势：**

- 提高代码的类型安全性，减少运行时错误
- 增强代码的可读性和可维护性
- IDE 支持更好，提供更准确的自动补全和错误提示
- 便于团队协作，统一类型定义
- 重构更安全，类型检查会在编译时发现问题

**注意事项：**

1. **避免使用 any**：尽量避免使用 `any` 类型，可以使用 `unknown` 作为替代
2. **类型完整性**：确保接口定义完整，包含所有必要的字段
3. **可选字段**：使用 `?` 标记可选字段，在 `withDefaults` 中设置默认值
4. **类型复用**：将常用类型定义导出，在多处复用
5. **泛型使用**：合理使用泛型，提高代码的灵活性

#### 5.7 方法定义规范

方法定义统一使用 `function xxx`，不要使用 `const xxx = () => {}`。

**❌ 不推荐：**

```typescript
const handleSave = () => {
  // 执行保存逻辑
};
```

**✅ 推荐：**

```typescript
function handleSave() {
  // 执行保存逻辑
}
```

## 组件命名规范

### 6. 组件命名和组织规范

在 Vue 项目中，组件的命名和组织方式对代码的可维护性至关重要。

#### 6.1 组件文件命名

**❌ 不推荐：**

```text
userlist.vue
UserProfile.vue
form-component.vue
button.vue
```

**✅ 推荐：**

```text
UserList.vue
UserProfileCard.vue
BaseForm.vue
BaseButton.vue
```

**命名规则：**

1. 使用 PascalCase（大驼峰）命名法
2. 基础组件以 `Base` 开头，如 `BaseButton.vue`
3. 单例组件以 `The` 开头，如 `TheHeader.vue`
4. 业务组件根据功能命名，如 `UserList.vue`

#### 6.2 组件注册命名

**❌ 不推荐：**

```vue
<template>
  <userlist />
  <user-profile />
  <base-button />
</template>

<script setup>
import userlist from "./UserList.vue";
import userProfile from "./UserProfile.vue";
import BaseButton from "./BaseButton.vue";
</script>
```

**✅ 推荐：**

```vue
<template>
  <UserList />
  <UserProfileCard />
  <BaseButton />
</template>

<script setup>
import UserList from "./UserList.vue";
import UserProfileCard from "./UserProfileCard.vue";
import BaseButton from "./BaseButton.vue";
</script>
```

#### 6.3 组件目录结构

**❌ 不推荐：**

```text
src/
├── components/
│   ├── UserList.vue
│   ├── UserProfile.vue
│   ├── Button.vue
│   ├── Form.vue
│   └── Modal.vue
```

**✅ 推荐：**

```text
src/
├── components/
│   ├── base/           # 基础组件
│   │   ├── BaseButton/
│   │   │   ├── index.vue
│   │   │   └── BaseButton.vue
│   │   ├── BaseForm/
│   │   │   ├── index.vue
│   │   │   └── BaseForm.vue
│   │   └── BaseModal/
│   │       ├── index.vue
│   │       └── BaseModal.vue
│   ├── business/       # 业务组件
│   │   ├── UserList/
│   │   │   ├── index.vue
│   │   │   ├── UserList.vue
│   │   │   └── components/
│   │   │       ├── UserItem.vue
│   │   │       └── UserFilter.vue
│   │   └── UserProfile/
│   │       ├── index.vue
│   │       └── UserProfile.vue
│   └── layout/         # 布局组件
│       ├── TheHeader/
│       │   ├── index.vue
│       │   └── TheHeader.vue
│       └── TheSidebar/
│           ├── index.vue
│           └── TheSidebar.vue
```

**目录结构说明：**

1. **base/**：存放基础组件，如按钮、表单、模态框等
2. **business/**：存放业务相关组件，如用户列表、产品卡片等
3. **layout/**：存放布局相关组件，如头部、侧边栏等
4. 每个组件都有自己的文件夹，包含 `index.vue` 和组件文件

#### 6.4 组件 Props 命名

**❌ 不推荐：**

```typescript
interface Props {
  user_data: any[];
  isloading: boolean;
  maxcount: number;
}
```

**✅ 推荐：**

```typescript
interface Props {
  userData: User[];
  isLoading: boolean;
  maxCount: number;
}
```

**Props 命名规则：**

1. 使用 camelCase（小驼峰）命名法
2. 布尔值属性以 `is`、`has`、`can` 等前缀开头
3. 避免使用缩写，使用完整的单词

#### 6.5 组件事件命名

**❌ 不推荐：**

```vue
<template>
  <button @click="$emit('click')">点击</button>
  <input @input="$emit('input-change', $event.target.value)" />
</template>
```

**✅ 推荐：**

```vue
<template>
  <button @click="handleClick">点击</button>
  <input @input="handleInputChange" />
</template>

<script setup>
const emit = defineEmits<{
  click: [];
  "input-change": [value: string];
}>();

// 处理点击事件
function handleClick() {
  emit("click");
}

// 处理输入变化事件
function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("input-change", target.value);
}
</script>
```

**事件命名规则：**

1. 使用 kebab-case（短横线）命名法
2. 事件名应该描述发生了什么，而不是如何处理
3. 提供明确的类型定义

**优势：**

- 提高代码的可读性和可维护性
- 统一的命名规范便于团队协作
- 清晰的目录结构便于查找和维护组件
- 类型安全的事件定义减少错误

**注意事项：**

1. **一致性**：整个项目中保持相同的命名规范
2. **语义化**：组件名应该清楚表达其功能和用途
3. **可复用性**：基础组件应该设计为高度可复用
4. **类型安全**：使用 TypeScript 提供完整的类型定义

## Element Plus 组件使用规范

> 已拆分到 `.agent/admin/element-plus.md`，命中 el-dialog 改动时按需加载。

## Vue 组件代码顺序

Vue 组件代码顺序统一参考 `.agent/naming.md` 中的“代码顺序规范”。

本文不再重复维护明细，避免 `naming.md` 与 `admin/vue.md` 出现规范漂移。
