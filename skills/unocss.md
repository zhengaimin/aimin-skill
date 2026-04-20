# UnoCSS 样式规范

> 从 `.agent/admin/vue.md` 拆出，命中 UnoCSS/Tailwind 样式改动时按需加载。

**核心原则**：尽量使用 UnoCSS 自带的变量，例如 `h-full`、`p-4`、`rounded-lg`，如果无法实现，则使用 `h-[10px]` 这种任意值语法。

## 1. 尺寸类名规范

**❌ 不推荐：**

```vue
<div class="h-[100%] w-[100%]"></div>
```

**✅ 推荐：**

```vue
<div class="h-full w-full"></div>
```

## 2. 间距类名规范

**❌ 不推荐：**

```vue
<div class="p-[10px] m-[20px]"></div>
```

**✅ 推荐：**

```vue
<!-- 优先使用标准间距变量 -->
<div class="p-2 m-4"></div>

<!-- 如果标准变量不满足需求，再使用任意值 -->
<div class="p-[10px] m-[20px]"></div>
```

**说明：**

- 优先使用 UnoCSS 预设的间距变量：`p-0`、`p-1`、`p-2`、`p-3`、`p-4`、`p-5`、`p-6`、`p-8`、`p-10`、`p-12`、`p-16`、`p-20`、`p-24`
- 当设计稿中的间距值不在预设列表中时，才使用 `p-[10px]` 这种任意值语法

## 3. 颜色类名规范

**❌ 不推荐：**

```vue
<div class="text-[#4a5975] bg-[#ffffff]"></div>
```

**✅ 推荐：**

```vue
<!-- 优先使用标准颜色变量 -->
<div class="text-gray-600 bg-white"></div>

<!-- 如果标准颜色不满足需求，再使用任意值 -->
<div class="text-[#4a5975] bg-[#ffffff]"></div>
```

## 4. 边框类名规范

**❌ 不推荐：**

```vue
<div class="border-[1px] border-solid border-[#0ec69a]"></div>
```

**✅ 推荐：**

```vue
<!-- 优先使用标准边框变量 -->
<div class="border border-solid border-teal-500"></div>

<!-- 如果标准边框不满足需求，再使用任意值 -->
<div class="border-[1px] border-solid border-[#0ec69a]"></div>
```

## 5. 圆角类名规范

**❌ 不推荐：**

```vue
<div class="rounded-[6px] rounded-[10px]"></div>
```

**✅ 推荐：**

```vue
<!-- 优先使用标准圆角变量 -->
<div class="rounded-md rounded-lg"></div>

<!-- 如果标准圆角不满足需求，再使用任意值 -->
<div class="rounded-[6px] rounded-[10px]"></div>
```

预设圆角：`rounded-none`、`rounded-sm`、`rounded`、`rounded-md`、`rounded-lg`、`rounded-xl`、`rounded-2xl`、`rounded-3xl`、`rounded-full`

## 6. 定位类名规范

**❌ 不推荐：**

```vue
<div class="top-[20px] left-[20px] z-[999]"></div>
```

**✅ 推荐：**

```vue
<!-- 优先使用标准定位变量 -->
<div class="top-5 left-5 z-50"></div>

<!-- 如果标准定位不满足需求，再使用任意值 -->
<div class="top-[20px] left-[20px] z-[999]"></div>
```

z-index 预设变量：`z-0`、`z-10`、`z-20`、`z-30`、`z-40`、`z-50`、`z-auto`

## 7. 样式组织规范

复杂组件建议使用 `@apply` 指令组织样式：

```vue
<style scoped>
.custom-card {
  @apply bg-white rounded-md shadow-md p-4;
}

.card-header {
  @apply text-lg font-bold text-gray-800 mb-2;
}
</style>
```

## 8. 响应式设计规范

```vue
<!-- 优先使用标准响应式断点 -->
<div class="w-full md:w-1/2 lg:w-1/3"></div>

<!-- 复杂布局使用标准栅格系统 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
```

## 9. 注意事项

1. **优先使用预设变量**：尽量使用 UnoCSS 自带的变量
2. **谨慎使用任意值**：只有在预设变量无法实现设计需求时才使用
3. **一致性**：在整个项目中保持相同的类名命名风格
4. **维护性**：复杂样式使用 `@apply` 指令集中管理
