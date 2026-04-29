<!-- aimin-skill-version: 0.1.0 -->

# UniApp 项目规则

适用于 UniApp 跨平台开发（小程序、H5、App）。

## 项目配置

- **框架**：Vue 3
- **路由**：`pages.json` 配置
- **API**：`uni.xxx` 统一接口
- **样式**：rpx 单位，条件编译

## 项目约束

- 不要过度封装，优先保持实现直接、可读
- 命名简单化，优先短而清晰的命名

---

## 1. 目录结构

```text
src/
├── pages.json            # 路由配置
├── manifest.json         # 应用配置
├── pages/                # 页面目录
│   └── {module}/
│       └── index.vue     # 页面文件
├── components/           # 组件目录
│   └── {name}.vue        # 组件文件（扁平结构）
├── api/                  # 接口封装
│   └── modules/
│       └── {module}.ts
├── config/               # 配置
│   └── constants.ts      # 常量
├── utils/                # 工具函数
└── static/               # 静态资源
```

---

## 2. 路由配置 (pages.json)

```json
{
  "pages": [
    {
      "path": "pages/home/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/user/index",
      "style": {
        "navigationBarTitleText": "用户"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#ffffff"
  },
  "subPackages": [
    {
      "root": "pages-sub/order",
      "pages": [
        { "path": "list/index", "style": { "navigationBarTitleText": "订单列表" } }
      ]
    }
  ]
}
```

---

## 3. 页面生命周期

UniApp 使用小程序生命周期，**不是** Vue 标准：

| 生命周期      | 说明                 |
| ------------- | -------------------- |
| `onLoad`      | 页面加载（接收参数） |
| `onShow`      | 页面显示             |
| `onHide`      | 页面隐藏             |
| `onUnload`    | 页面卸载             |
| `onPullDownRefresh` | 下拉刷新      |
| `onReachBottom`      | 上拉触底      |

**注意**：`mounted` 在小程序端行为不一致，优先使用 `onLoad`。

```vue
<script setup lang="ts">
/** 页面加载 */
onLoad((query) => {
  // query 为路由参数
  console.log(query.id);
});

/** 页面显示 */
onShow(() => {
  // 刷新数据
});

/** 下拉刷新 */
onPullDownRefresh(() => {
  // 刷新完成后停止
  uni.stopPullDownRefresh();
});
</script>
```

---

## 4. API 调用规范

### 4.1 uni.xxx 封装

```typescript
// src/api/modules/user.ts

/** 获取用户信息 */
export function getUserInfoApi(): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: "/api/user/info",
      method: "GET",
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as UserInfo);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
}

/** 封装带错误处理的请求 */
async function axiosGetUserInfoApi(): Promise<UserInfo | null> {
  try {
    return await getUserInfoApi();
  } catch (error) {
    console.error("axiosGetUserInfoApi:", error);
    uni.showToast({ title: "请求失败", icon: "none" });
    return null;
  }
}
```

### 4.2 常用 uni API

| API               | 用途           |
| ----------------- | -------------- |
| `uni.navigateTo`  | 跳转页面       |
| `uni.redirectTo`  | 重定向页面     |
| `uni.switchTab`   | 切换 Tab       |
| `uni.showToast`   | 显示提示       |
| `uni.showLoading` | 显示加载       |
| `uni.request`     | 网络请求       |
| `uni.getStorage`  | 本地存储       |

---

## 5. 组件规范

### 5.1 组件限制

- **不能**使用原生 HTML 标签（`div`、`span` 等），使用 `view`、`text`
- **不能**使用部分 Vue 特性（`v-show` 在部分平台不支持）
- **必须**使用 UniApp 兼容组件

### 5.2 组件命名

```
components/
├── UserCard.vue      # 业务组件
├── NavBar.vue        # 通用组件
└── Empty.vue         # 状态组件
```

### 5.3 组件通信

```vue
<!-- 父组件 -->
<template>
  <UserCard :user="userInfo" @refresh="handleRefresh" />
</template>

<!-- 子组件 -->
<script setup lang="ts">
const props = defineProps<{ user: UserInfo }>();
const emit = defineEmits<{ refresh: [] }>();
</script>
```

---

## 6. 条件编译

针对不同平台编写差异化代码：

```vue
<template>
  <!-- #ifdef H5 -->
  <web-view src="https://example.com"></web-view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <button open-type="getPhoneNumber">获取手机号</button>
  <!-- #endif -->

  <!-- #ifdef APP -->
  <view>App 专属内容</view>
  <!-- #endif -->
</template>

<script setup lang="ts">
// #ifdef H5
console.log("H5 环境");
// #endif

// #ifdef MP-WEIXIN
console.log("微信小程序");
// #endif
</script>

<style>
/* #ifdef H5 */
.box { padding: 20px; }
/* #endif */

/* #ifdef MP-WEIXIN */
.box { padding: 40rpx; }
/* #endif */
</style>
```

---

## 7. 样式规范

### 7.1 单位

- 使用 `rpx` 作为响应式单位（750rpx = 屏幕宽度）
- 字体大小建议 `28rpx` - `32rpx`

### 7.2 全局样式

在 `App.vue` 中定义：

```vue
<style>
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
}

/* 通用类 */
.text-center { text-align: center; }
.flex-center { display: flex; justify-content: center; align-items: center; }
</style>
```

---

## 8. 注意事项

1. **生命周期差异**：优先使用 `onLoad` 而非 `mounted`
2. **组件兼容**：避免使用原生 HTML 标签
3. **API 封装**：`uni.request` 需手动封装 Promise
4. **条件编译**：平台差异用条件编译处理
5. **分包配置**：大型应用需配置 `subPackages`
