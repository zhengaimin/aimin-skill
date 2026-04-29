<!-- aimin-skill-version: 0.1.0 -->

# Admin 弹窗模板

本文档用于指导后台管理系统弹窗组件开发。

> 命名规范与代码顺序规范统一参考 `.agent/naming.md`。

## 1. 弹窗类型定义

`TModalType` / `TModalParams` 为全局类型，统一在 `src/typings/modal.d.ts` 中维护并使用，弹窗内禁止重复定义：

```ts
export {};

declare global {
  /** 弹窗类型 */
  type TModalType = "Add" | "Edit" | "View";
  /** 弹窗参数 */
  type TModalParams = {
    title: string;
    type: TModalType;
    showConfirm: boolean;
  };
}
```

> `parameter` 的 `type` 字段不要写 `as "Add" | "Edit" | "View"`，保持为普通字符串字面量，由 `TModalParams` 负责类型收敛。

## 2. 弹窗组件模板 (modal/{Entity}.vue)

```vue
<script setup lang="ts">
import type { FormInstance } from "element-plus";
import type { {Entity} } from "@/api/interface";

import { computed, nextTick, ref, unref } from "vue";

import { postCreate{Entity}Api, get{Entity}DetailApi, putUpdate{Entity}Api } from "@/api/modules";

import { ElMessage } from "element-plus";

import { ENABLE_STATUS } from "@/config/modules";

import SchoolInfo from "@/components/Business/SchoolInfo/index.vue";
import { useSchool } from "@/hooks/useSchool";

const { schoolId, schoolName: storeSchoolName } = useSchool();

const emits = defineEmits(["submit"]);

/** 当前学校名称 */
const currentSchoolName = ref("");
/** 弹窗显示状态 */
const visible = ref(false);
/** 弹窗参数 */
const parameter = ref<TModalParams>({
  title: "",
  type: "Add",
  showConfirm: true
});
/** 表单实例 */
const ruleFormRef = ref<FormInstance>();
/** 表单数据 */
const ruleForm = ref<Partial<{Entity}.I{Entity}Item>>({});
/** 表单校验规则 */
const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
};

/** 是否新增 */
const isAdd = computed(() => parameter.value.type === "Add");
/** 是否编辑 */
const isEdit = computed(() => parameter.value.type === "Edit");

/**
 * 获取初始表单数据
 * @returns 初始表单数据
 */
function getInitialFormData(): Partial<{Entity}.I{Entity}Item> {
  return {
    status: ENABLE_STATUS.ENABLED
  };
}

/**
 * 获取详情数据
 * @param id 主键
 * @returns 接口结果
 */
async function axiosGet{Entity}DetailApi(id: number) {
  try {
    const result = await get{Entity}DetailApi(id);
    if (result.code === 0) {
      ruleForm.value = result.data;
    }
    return result;
  } catch (error) {
    console.error("axiosGet{Entity}DetailApi:", error);
    return { code: -1, data: null };
  }
}

/**
 * 新增数据
 * @param form 表单数据
 * @returns 接口结果
 */
async function axiosPostCreate{Entity}Api(form: Partial<{Entity}.ReqPostCreate{Entity}Api>) {
  try {
    const payload: {Entity}.ReqPostCreate{Entity}Api = {
      // TODO: 按需拼接字段
      ...(form as {Entity}.ReqPostCreate{Entity}Api)
    };
    const result = await postCreate{Entity}Api(payload);
    if (result.code === 0) {
      ElMessage.success("添加成功");
    }
    return result;
  } catch (error) {
    console.error("axiosPostCreate{Entity}Api:", error);
    return { code: -1, data: null };
  }
}

/**
 * 更新数据
 * @param id 主键
 * @param form 表单数据
 * @returns 接口结果
 */
async function axiosPutUpdate{Entity}Api(id: number, form: Partial<{Entity}.ReqPutUpdate{Entity}Api>) {
  try {
    const payload: {Entity}.ReqPutUpdate{Entity}Api = {
      // TODO: 按需拼接字段
      ...(form as {Entity}.ReqPutUpdate{Entity}Api)
    };
    const result = await putUpdate{Entity}Api(id, payload);
    if (result.code === 0) {
      ElMessage.success("编辑成功");
    }
    return result;
  } catch (error) {
    console.error("axiosPutUpdate{Entity}Api:", error);
    return { code: -1, data: null };
  }
}

/**
 * 提交表单
 * @param formEl 表单实例
 * @returns void
 */
async function handleSubmitForm(formEl?: FormInstance): Promise<void> {
  if (!formEl) return;
  await formEl.validate(async (valid: boolean) => {
    if (!valid) return;
    const form = unref(ruleForm);
    if (isAdd.value) {
      const result = await axiosPostCreate{Entity}Api({
        ...form,
        schoolId: Number(schoolId.value)
      });
      if (result.code !== 0) return;
    } else if (isEdit.value && form.id) {
      const result = await axiosPutUpdate{Entity}Api(form.id, form);
      if (result.code !== 0) return;
    }
    visible.value = false;
    emits("submit");
  });
}

/**
 * 接收参数
 * @param params 弹窗参数
 * @param row 当前行
 * @returns void
 */
async function acceptParams(params: TModalParams, row?: {Entity}.I{Entity}Item): Promise<void> {
  parameter.value = { ...parameter.value, ...params };
  if (isAdd.value) {
    ruleForm.value = {
      ...getInitialFormData(),
      schoolId: Number(schoolId.value)
    };
    currentSchoolName.value = storeSchoolName.value;
  } else if (row?.id) {
    await axiosGet{Entity}DetailApi(row.id);
    currentSchoolName.value = row.schoolName ?? "";
  }

  visible.value = true;
  nextTick(() => {
    ruleFormRef.value?.clearValidate();
  });
}

defineExpose({ acceptParams });
</script>

<template>
  <el-dialog v-model="visible" :title="parameter.title" width="640px" destroy-on-close draggable align-center>
    <SchoolInfo :name="currentSchoolName" />
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input v-model="ruleForm.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <!-- 其他字段... -->
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="parameter.showConfirm" type="primary" @click="handleSubmitForm(ruleFormRef)"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-form-item) {
  width: 100%;
}
</style>
```

## 3. 详情弹窗模板 (modal/Detail.vue)

查看必须使用独立的 `modal/Detail.vue`，不要复用 `modal/{Entity}.vue`。

```vue
<script setup lang="ts">
import type { {Entity} } from "@/api/interface";

import { nextTick, ref } from "vue";

import { get{Entity}DetailApi } from "@/api/modules";

import SchoolInfo from "@/components/Business/SchoolInfo/index.vue";

const emits = defineEmits(["submit"]);

/** 当前学校名称 */
const currentSchoolName = ref("");
/** 弹窗显示状态 */
const visible = ref(false);
/** 弹窗参数 */
const parameter = ref<TModalParams>({
  title: "",
  type: "View",
  showConfirm: false
});
/** 详情数据 */
const detailData = ref<{Entity}.I{Entity}Item>();

/**
 * 获取详情数据
 * @param id 主键
 * @returns 接口结果
 */
async function axiosGet{Entity}DetailApi(id: number) {
  try {
    const result = await get{Entity}DetailApi(id);
    if (result.code === 0) {
      detailData.value = result.data;
    }
    return result;
  } catch (error) {
    console.error("axiosGet{Entity}DetailApi:", error);
    return { code: -1, data: null };
  }
}

/**
 * 接收参数
 * @param params 弹窗参数
 * @param row 当前行
 * @returns void
 */
async function acceptParams(params: TModalParams, row?: {Entity}.I{Entity}Item): Promise<void> {
  parameter.value = { ...parameter.value, ...params };
  if (row?.id) {
    await axiosGet{Entity}DetailApi(row.id);
    currentSchoolName.value = row.schoolName ?? "";
  }
  visible.value = true;
  nextTick(() => {});
}

defineExpose({ acceptParams });
</script>

<template>
  <el-dialog v-model="visible" :title="parameter.title" width="640px" destroy-on-close draggable align-center>
    <SchoolInfo :name="currentSchoolName" />
    <!-- 详情展示内容，根据业务自行实现 -->
    <el-descriptions :column="2" border>
      <el-descriptions-item label="名称">{{ detailData?.name }}</el-descriptions-item>
      <!-- 其他字段... -->
    </el-descriptions>
  </el-dialog>
</template>
```

## 4. 表单布局规范

`el-form` 必须配合 `el-row` + `el-col` 使用，不允许直接在 `el-form` 下使用 `div` 做布局。

```vue
<!-- 两列布局 -->
<el-row :gutter="24">
  <el-col :span="12">
    <el-form-item label="字段1" prop="field1">...</el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item label="字段2" prop="field2">...</el-form-item>
  </el-col>
</el-row>

<!-- 单列布局（textarea 等） -->
<el-row :gutter="24">
  <el-col :span="24">
    <el-form-item label="描述" prop="description">
      <el-input type="textarea" :rows="3" />
    </el-form-item>
  </el-col>
</el-row>
```

- 表单字段顺序：必填字段放在前面，非必填字段放在后面。
- 状态字段（启用/禁用）统一使用 `el-select` 下拉，默认值设置为 `ENABLE_STATUS.ENABLED`。

```vue
<el-form-item label="状态" prop="status">
  <el-select v-model="ruleForm.status" placeholder="请选择状态" class="w-full">
    <el-option v-for="item in ENABLE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</el-form-item>
```

## 5. 弹窗宽度规范

**核心原则**：`el-dialog` 的宽度只能使用以下四种预设尺寸：`480px`、`640px`、`760px`、`1120px`。

### 宽度选择指南

| 尺寸 | 宽度     | 适用场景                                        |
| ---- | -------- | ----------------------------------------------- |
| 迷你 | `480px`  | 极简确认/提示、单字段表单（命令下发、状态切换） |
| 小   | `640px`  | 简单确认/提示、少量字段表单（1-3 个字段）       |
| 中等 | `760px`  | 中等复杂表单（4-8 个字段）、左右布局表单        |
| 大   | `1120px` | 复杂表单（8+ 字段）、含表格/列表、多分栏布局    |

### 错误示例

```vue
<!-- ❌ 不推荐的宽度值 -->
<el-dialog width="600px">...</el-dialog>
<el-dialog width="50%">...</el-dialog>
<el-dialog width="800px">...</el-dialog>
<el-dialog width="1000px">...</el-dialog>
<el-dialog width="60vw">...</el-dialog>
<el-dialog width="auto">...</el-dialog>
```

### 响应式处理

需要响应式适配时，使用计算属性但仍遵循预设尺寸：

```vue
<template>
  <el-dialog :width="dialogWidth">...</el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";

const { width } = useWindowSize();

/** 根据屏幕宽度动态设置对话框宽度 */
const dialogWidth = computed(() => {
  if (width.value < 768) return "640px";
  if (width.value < 1200) return "760px";
  return "1120px";
});
</script>
```

### 注意事项

1. **严格遵守**：所有 `el-dialog` 必须使用四种预设宽度之一
2. **场景匹配**：根据对话框内容复杂度选择合适的宽度
3. **避免嵌套**：避免对话框嵌套，如必须嵌套，内层使用更小的尺寸
4. **移动端适配**：移动端可使用 `fullscreen` 属性

## 6. 弹窗通用属性

弹窗必须带 `destroy-on-close`、`draggable`、`align-center` 属性。

```vue
<el-dialog v-model="visible" :title="parameter.title" width="640px" destroy-on-close draggable align-center>
  ...
</el-dialog>
```
