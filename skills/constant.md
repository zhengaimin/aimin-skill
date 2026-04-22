# 常量与枚举规范

本文件是可复用的通用规范，复制到其他项目时只需修改"项目配置"中的路径。

## 1. 项目配置（复制后先改这里）

| 配置项       | 默认值（以项目实际为准）                          |
| ------------ | ------------------------------------------------- |
| 常量根目录   | `src/constants/modules/` 或 `src/config/modules/` |
| 聚合导出     | `{常量根目录}/index.ts`                           |
| 别名导入     | `@/constants/modules` 或 `@/config/modules`       |
| 索引文件     | 按项目约定                                        |
| 索引收录范围 | 按项目约定                                        |

## 2. 目录结构

按业务域划分子目录，每个模块独立文件：

```text
src/constants/modules/
├── index.ts              # 统一导出
├── {业务域}/
│   ├── index.ts          # 模块导出
│   └── {枚举名}.ts       # 单个枚举文件
```

## 3. 命名规范

| 类型     | 命名                        | 示例                      |
| -------- | --------------------------- | ------------------------- |
| 枚举     | `UPPER_SNAKE_CASE`          | `USER_TYPE`, `CALL_TYPE`  |
| 枚举值   | `UPPER_CASE` 或 `camelCase` | `STUDENT`, `video`, `SIP` |
| 类型值   | `T{ENUM}_VALUE`             | `TUSER_TYPE_VALUE`        |
| 中文文案 | `{ENUM}_I18N`               | `USER_TYPE_I18N`          |
| 选项数组 | `{ENUM}_OPTIONS`            | `USER_TYPE_OPTIONS`       |

## 4. 模块划分原则

1. **按业务域划分**：用户、订单、消息等
2. **通用抽离**：状态、开关、星期等放 `common`
3. **单一职责**：每个文件一个枚举（或强相关的多个）

## 5. 枚举值来源

| 来源           | 说明                       |
| -------------- | -------------------------- |
| **后端协议**   | 字段值与后端一致，不可修改 |
| **前端自定义** | 业务逻辑需要，自行定义     |

## 6. I18N 文案规则

```typescript
/** 用户类型文案 */
export const USER_TYPE_I18N: Record<TUSER_TYPE_VALUE, string> = {
  [USER_TYPE.STUDENT]: "学生",
  [USER_TYPE.TEACHER]: "教师"
};
```

- 中文优先，用于界面展示
- 协议标识类保持英文
- 按后端接口文档定义文本

## 7. 模板

```typescript
/** {枚举描述} */
export enum {ENUM_NAME} {
  /** {选项描述} */
  {OPTION} = "{value}",
}

/** {枚举描述}值 */
export type T{ENUM_NAME}_VALUE =
  (typeof {ENUM_NAME})[keyof typeof {ENUM_NAME}];

/** {枚举描述}文案 */
export const {ENUM_NAME}_I18N: Record<T{ENUM_NAME}_VALUE, string> = {
  [{ENUM_NAME}.{OPTION}]: "中文",
};

/** {枚举描述}选项 */
export const {ENUM_NAME}_OPTIONS: Array<{ label: string; value: T{ENUM_NAME}_VALUE }> = [
  { label: {ENUM_NAME}_I18N[{ENUM_NAME}.{OPTION}], value: {ENUM_NAME}.{OPTION} },
];
```

## 8. 使用示例

```typescript
import { ORDER_STATUS, ORDER_STATUS_I18N, ORDER_STATUS_OPTIONS } from "@/constants/modules";

const status = ORDER_STATUS.PAID;
const text = ORDER_STATUS_I18N[status];
const options = ORDER_STATUS_OPTIONS;
```

## 9. 新增枚举流程

1. 在对应模块目录下新增枚举文件
2. 按模板提供 Enum/Type/I18N/Options（按需裁剪）
3. 在模块 `index.ts` 与根 `index.ts` 中导出
4. 若项目维护接口常量索引，则同步更新对应索引文件

## 10. 索引维护

索引文件仅记录 `src/api/**` 产出的接口常量/枚举的：

- 枚举名称、描述、值类型
- 类型名称（`T` 前缀）
- 文件位置
- 枚举值清单（值 + 中文）

页面级 `constants.ts` / `types.ts` / `utils/**` 不进入该索引。

**重要**：接口常量变更后必须同步更新索引文件。