<!-- aimin-skill-version: 0.1.0 -->

# Admin 主页面模板

本文档用于指导后台管理系统主页面开发，当前模板聚焦表格类 CRUD 页面。

> 命名规范与代码顺序规范统一参考 `.agent/naming.md`，本文仅补充 Admin 表格页面相关规则。

## 0. 项目自定义

- **页面目录**：`src/views/{模块名}/{页面名}/`
- **弹窗目录**：`src/views/{模块名}/{页面名}/modal/`
- **API 目录**：`src/api/modules/{模块名}/`
- **类型目录**：`src/api/interface/modules/{模块名}/`
- **常量目录**：`src/config/modules/{模块名}/`

## 1. 目录结构

`View` 场景必须单独拆为 `modal/Detail.vue`。

```text
src/views/{模块名}/{页面名}/
├── index.vue          # 主页面（表格）
├── types.ts           # 页面局部类型（按需）
├── constants.ts       # 页面局部常量（按需）
├── utils/
│   └── payload.ts     # 提交字段超过 3 个时必备
└── modal/
    ├── {Entity}.vue   # 新增/编辑弹窗
    └── Detail.vue     # 查看详情弹窗
```

- `constants.ts` 只承接存在复用价值的枚举/映射类页面常量，例如 `OPTIONS`、`STATUS`、`TYPE`、`ENUM`、`MAP` 及其 `I18N` / `CONFIGS`。
- 仅出现一次的局部常量默认留在当前页面或组件内，不强制抽到 `constants.ts`。
- 通用纯函数、payload 构建、格式化/转换方法统一放 `utils/`，不要新增 `config.ts`。
- 未使用的 `types.ts` / `constants.ts` / `utils/` 不创建空壳文件或空目录。

## 2. 接口规范

| 接口类型 | 方法      | 命名规范                     | 是否必填 |
| -------- | --------- | ---------------------------- | -------- |
| 获取列表 | GET       | `get{Entity}ListApi`         | **必填** |
| 新增     | POST      | `post{Entity}Api`            | 可选     |
| 删除     | DELETE    | `delete{Entity}Api`          | 可选     |
| 更新     | PUT       | `putUpdate{Entity}Api`       | 可选     |
| 更新状态 | PUT/PATCH | `putUpdate{Entity}StatusApi` | 可选     |

- **接口必须二次封装**：页面内所有 API 调用都要封装为 `axios{HttpMethod}{Action}Api` 再使用，遵循 `.agent/naming.md` 的封装规范。
- **axios 异常处理**：`axios{HttpMethod}{Action}Api` 内部 `catch` 必须 `console.error(error)`，并 `return { code: -1, data: null }`。
- **useManage 例外**：`useManage` 传入的 `get/delete/update` 接口不需要再包一层 `axios{HttpMethod}{Action}Api`，直接传入 `src/api/modules` 的方法即可。
- **弹窗提交规范**：当 modal 的 `handleSubmitForm` 同时包含新增/更新两种接口调用时，必须分别封装 `axiosPost...` / `axiosPut...`；请求参数拼装与响应处理（如成功提示、失败兜底）统一放到封装内。如果只调用一种接口，则不强制封装。
- **payload 封装规范**：当提交字段超过 **3 个** 时，必须把请求参数拼装抽到页面上级目录的 `utils/payload.ts`，通过 `buildPost{Entity}Payload` / `buildPut{Entity}Payload` 进行**逐字段赋值**与**必要的 trim/undefined 处理**；字段不超过 3 个时可在 `axiosPost...` / `axiosPut...` 中直接拼装。
- **loading 规则**：
  - 表格页：`get/delete/update` 默认使用全局 loading（不要传 `{ loading: false }`）。
  - 弹窗页：详情与提交（新增/更新）走接口级别 loading（默认）；其他辅助接口默认传 `{ loading: false }`，并用 `v-loading` 做局部 loading。

## 3. 主页面模板 (index.vue)

```vue
<script setup lang="ts" name="{pageName}">
import type { {Entity} } from "@/api/interface";
import type { ColumnProps } from "@/components/ProTable/interface";

import { ref, watch } from "vue";
import { CirclePlus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import { get{Entity}ListApi, delete{Entity}Api } from "@/api/modules";

import ProTable from "@/components/ProTable/index.vue";
import {Entity}Modal from "./modal/{Entity}.vue";
import DetailModal from "./modal/Detail.vue";
import { useManage } from "@/hooks/useManage";
import { useSchool } from "@/hooks/useSchool";

const { isAllSchools, schoolId } = useSchool();
const { proTable, axiosGetTableList, refreshTableList, deleteRow } = useManage(
  {
    get: get{Entity}ListApi,
    delete: delete{Entity}Api,
    // update: putUpdate{Entity}StatusApi,  // 如有状态切换功能
  },
  null,
  null
);

/** 新增编辑弹窗引用 */
const modalRef = ref();
/** 详情弹窗引用 */
const detailModalRef = ref();
/** 表格列配置 */
const columns: ColumnProps<{Entity}.I{Entity}Item>[] = [
  { type: "index", label: "#", width: 60 },
  // { type: "selection", width: 50 },  // 如需多选
  { prop: "name", label: "名称", minWidth: 150 },
  // 搜索字段示例
  // {
  //   prop: "status",
  //   label: "状态",
  //   width: 100,
  //   enum: STATUS_OPTIONS,
  //   search: { el: "select", props: { placeholder: "请选择状态" } }
  // },
  { prop: "operation", label: "操作", width: 200, fixed: "right" }
];

/**
 * 显示新增编辑弹窗
 * @param type 弹窗类型
 * @param row 当前行
 * @returns void
 */
function handleShowModal(type: "Add" | "Edit", row?: {Entity}.I{Entity}Item): void {
  if (type === "Add" && isAllSchools.value) {
    ElMessage.warning("请选择学校后再新增");
    return;
  }
  const titleMap = {
    Add: "新增{entityName}",
    Edit: "编辑{entityName}"
  };
  const showConfirm = type === "Add" || type === "Edit";
  modalRef.value.acceptParams({ title: titleMap[type], type, showConfirm }, row);
}

/**
 * 显示详情弹窗
 * @param row 当前行
 * @returns void
 */
function handleShowDetail(row: {Entity}.I{Entity}Item): void {
  detailModalRef.value.acceptParams({ title: "查看{entityName}", type: "View", showConfirm: false }, row);
}

watch(schoolId, () => refreshTableList());
</script>

<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="axiosGetTableList" row-key="id" table-header="{tableTitle}">
      <!-- 工具按钮 -->
      <template #toolButton>
        <el-button type="primary" :icon="CirclePlus" @click="handleShowModal('Add')">新增</el-button>
      </template>

      <!-- 操作列 -->
      <template #operation="{ row }">
        <el-button type="primary" link @click="handleShowDetail(row)">查看</el-button>
        <el-button type="primary" link @click="handleShowModal('Edit', row)">编辑</el-button>
        <el-button type="danger" link @click="deleteRow(row.id, row.name)">删除</el-button>
      </template>
    </ProTable>

    <{Entity}Modal ref="modalRef" @submit="refreshTableList" />
    <DetailModal ref="detailModalRef" />
  </div>
</template>
```

## 4. 常用 Hooks

| Hook        | 用途     | 返回值                                                                     |
| ----------- | -------- | -------------------------------------------------------------------------- |
| `useManage` | 表格管理 | `{ proTable, axiosGetTableList, refreshTableList, deleteRow, onBeforeSwitchActive }` |

## 5. 状态字段规范

状态（启用/禁用）统一使用 `el-select` 下拉，默认值为 `ENABLE_STATUS.ENABLED`。如需在列表内快速修改状态，可在 `#status` 插槽中使用 `el-select` 并在 `change` 时调用更新接口。

```vue
<script setup>
import { ENABLE_STATUS, ENABLE_STATUS_OPTIONS } from "@/config/modules";

// 状态变更
async function handleStatusChange(row) {
  try {
    await updateStatusApi({
      id: row.id,
      status: row.status ?? ENABLE_STATUS.ENABLED
    });
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <template #status="{ row }">
    <el-select v-model="row.status" class="w-full" @change="() => handleStatusChange(row)">
      <el-option v-for="item in ENABLE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </template>
</template>
```
