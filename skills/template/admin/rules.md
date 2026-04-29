<!-- aimin-skill-version: 0.1.0 -->

# 后台管理规则

适用于 admin/xxx 后台管理模块的接口与页面开发。

## 后台管理通用规则

- 需要进行构建性能分析时，使用 CPU Profile 方式运行打包，不通过修改配置启用（如 `node --cpu-prof --cpu-prof-name=vite-build.cpuprofile node_modules/vite/bin/vite.js build --mode production`）

## 任务 1：新增/更新接口与类型

- 只在 `src/api/interface/**` 写类型、在 `src/api/modules/**` 写请求，做到类型与请求分离。
- 按 `.agent/api.md` 使用 `namespace` 分组与统一命名（`Req*`、`Res*`、`I*Vo/Dto`）。
- 请求函数必须显式声明响应类型，并使用项目既有 `http/request` 封装。
- 涉及枚举字段时：
  - 在 `src/config/modules/**` 按 `.agent/constant.md` 提供 Enum/Type/I18N/Options。
- 参考 `src/api/modules/` 现有 `.ts` 风格，避免新增不一致的风格。

## 任务 2：实现表格 + 弹窗页面

- 目录与文件结构严格按 `.agent/admin/table.md`：落地 `index.vue`、`modal/{Entity}.vue`；查看场景必须额外提供 `modal/Detail.vue`。
- 详情/查看必须使用独立详情弹窗（`modal/Detail.vue`），不得复用新增/编辑弹窗。
- 表格页使用 `ProTable` 与 `useManage`，并遵循接口封装与异常处理约束。
- 弹窗内新增/编辑接口必须封装 `axios{HttpMethod}{Action}Api`，并在 `catch` 里 `console.error`。
- 表单布局必须使用 `el-row` + `el-col`，状态字段使用 `ENABLE_STATUS` 系列常量。
- Admin `.vue`（`<script setup>`）变量/方法固定分组顺序（参考 uniapp）：变量按 `useXXX Hook 调用 -> ref/reactive -> computed`；方法按 `通用方法 -> axios*Api -> handle* -> on* 生命周期 -> watch/watchEffect`。
- 分组空行规则（强制）：分组之间保留一个空行；分组内部连续排列且禁止空行；禁止跨分组穿插声明。
- 弹窗场景的 `acceptParams` 固定放在 `watch/watchEffect` 前。
- 常量提取必须遵循本地模板要求：接口枚举、页面级状态/类型/枚举/映射类常量优先抽离；布局尺寸、提示文案、轻量默认值默认不强制；组件内局部使用默认不强制。
- 弹窗 `parameter` 的 `type` 字段直接写字符串字面量，不要使用 `as` 强转。
- 弹窗类型 `TModalType` 与参数 `TModalParams` 统一来自 `src/typings/modal.d.ts`，弹窗内禁止重复定义。
- UI 类名优先使用 Tailwind/UnoCSS（如果已有样式约定，则以项目现状为准）。

## 详情弹窗模板（必须使用）

> 详情弹窗文件固定为 `modal/Detail.vue`，用于展示"查看/详情"，仅展示不编辑。
> 详情接口走全局 loading，不在详情弹窗内使用 `v-loading`。

```vue
<script setup lang="ts">
import type { {Entity} } from "@/api/interface";

import { ref } from "vue";
import { get{Entity}DetailApi } from "@/api/modules";

/** 弹窗可见 */
const visible = ref(false);
/** 详情数据 */
const detail = ref<{Entity}.I{Entity}DetailVo | null>(null);
/** 弹窗参数 */
const parameter = ref<TModalParams>({
  title: "",
  type: "View",
  showConfirm: false
});

// 获取详情
async function axiosGet{Entity}DetailApi(id: number) {
  try {
    return await get{Entity}DetailApi(id);
  } catch (error) {
    console.error("axiosGet{Entity}DetailApi:", error);
    return { code: -1, data: null };
  }
}

// 接收参数
async function acceptParams(params: TModalParams, row?: {Entity}.I{Entity}ItemVo) {
  parameter.value = { ...parameter.value, ...params };
  detail.value = null;
  if (!row?.id) return;
  const result = await axiosGet{Entity}DetailApi(row.id);
  if (result.code === 0) {
    detail.value = result.data;
  }
  visible.value = true;
}

defineExpose({ acceptParams });
</script>

<template>
  <el-dialog v-model="visible" :title="parameter.title" width="760px" destroy-on-close draggable align-center>
    <el-descriptions v-if="detail" :column="2" border>
      <!-- 字段展示 -->
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
```

## 输出检查清单

- 接口类型与请求方法命名一致，返回类型已显式声明。
- 枚举常量按规范提供 Type/I18N/Options，并更新索引表。
- 页面结构包含 `index.vue` 与 `modal/{Entity}.vue`；存在查看场景时必须补充 `modal/Detail.vue`。
- 异常处理与成功提示按规范封装，代码注释使用中文。
- 无未使用变量或未使用导入。
