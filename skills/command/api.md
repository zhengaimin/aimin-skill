# 命令：`--api` 新增接口

按照 `.agent/api.md` 添加接口及类型。

## 步骤

1. **定义接口类型** → `src/api/interface/modules/{模块名}/`
   - 使用 `namespace` 分组
   - 请求类型：`Req[HttpMethod][Action][Feature]Api`
   - 响应类型：`Res[HttpMethod][Action][Feature]Api`

2. **编写请求函数** → `src/api/modules/{模块名}/`
   - 命名：`[httpMethod][Action]Api`（如 `getDeviceGroupsApi`）
   - 显式声明响应类型，来源 `src/api/interface/**`

3. **处理枚举值**（如果接口涉及枚举字段）
   - 3.1 在 `src/config/modules/{模块名}/` 下按 `.agent/constant.md` 规范创建枚举文件
   - 3.2 每个枚举需提供：`Enum` / `Type` / `I18N` / `Options`
   - 3.3 将枚举信息同步到 `index/constants-index.json`：
     - 先检查是否已存在同名枚举，已存在则**更新**而非新增
     - 写入 `name`、`description`、`valueType`、`typeName`、`filePath`、`values`
   - 3.4 在接口类型中引用 `TxxxValue`，替换原始 `number/string`

4. **更新索引**
   - 同步更新 `index/constants-index.json`（如有新枚举）
   - 更新 `lastUpdated` 字段为当前日期