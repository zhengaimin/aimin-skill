# 目标

`/am:init` 固定初始化项目根目录 `AGENTS.md`、`CLAUDE.md` 与项目侧 `.agent/index/**`、`.agent/scripts/lint.md`，再根据当前项目主类型在 `.agent/admin/**`、`.agent/tauri/**`、`.agent/uni/**` 中选择一组目录文件。

## 执行原则

1. 先检查仓库现状，再判断当前项目主类型。
2. 固定创建或更新这 5 个项目文件：
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.agent/index/constants.json`
   - `.agent/index/utils.json`
   - `.agent/scripts/lint.md`
3. 再按当前项目主类型在以下目录中最多选择一组并创建或更新：
   - admin 项目：`.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md`
   - tauri 项目：`.agent/tauri/rules.md`
   - uni 项目：`.agent/uni/rules.md`
4. 如果未命中 admin、tauri、uni，技术栈目录不要创建。
5. 识别项目类型时优先看真实仓库特征：
   - admin：存在后台管理目录结构、`src/views/**`、`src/api/modules/**`、Element Plus / ProTable / admin 约定
   - tauri：存在 `src-tauri/`、`tauri.conf.json`、`Cargo.toml`、`@tauri-apps/*`
   - uni：存在 `pages.json`、`manifest.json`、`uni_modules/`、`uni.*` API
6. 如果缺少父目录，只补根目录 `AGENTS.md`、`CLAUDE.md`，以及 `.agent/index/`、`.agent/scripts/` 和命中的 `.agent/admin/`、`.agent/tauri/`、`.agent/uni/`。
7. `AGENTS.md` 与 `CLAUDE.md` 以参考模板为基线创建或更新，只保留入口、边界和路由说明这类根文档内容，优先引用当前项目已有或本次初始化生成的规则文件，不要把不存在的 `.agent/**` 文件写成硬依赖。
8. 不要创建或修改根目录 `.gitignore`。
9. 不要创建 `.agent/README.md`，也不要创建 `.agent/comment.md`、`.agent/naming.md`、`.agent/constant.md`、`.agent/api.md`、`.agent/vue.md`、`.agent/unocss.md`。
10. `skills/template/` 是初始化模板目录；初始化时将其中内容放到目标项目对应位置，再按额外规则向 `.agent/**` 追加内容。`AGENTS.md` 与 `CLAUDE.md` 默认保留参考模板原有标题、结构和路由，不要把模板整体改写成另一份文档。
11. 如果需要添加项目自己的规则，应在 `.agent/` 下重新开一个一级目录，使用 `# {projectname}` 作为标题，并在该目录下展开项目专属约定。
12. 参考模板只用于根文档与命中规则文件的基线结构，不要把无关规则文件复制进项目。
13. 如果项目里已有相关文件，只做最小增量更新，补齐缺失段落，不要覆盖用户已有内容。

## 项目自有文件

- `AGENTS.md`
- `CLAUDE.md`
- `.agent/index/constants.json`
- `.agent/index/utils.json`
- `.agent/scripts/lint.md`
- `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md` 中的一组，或 `.agent/tauri/rules.md`，或 `.agent/uni/rules.md`

除固定文件和命中的技术栈目录外，本次初始化不应新增任何其他项目文件。

## 硬性验收

初始化完成前必须满足：

- `AGENTS.md` 存在
- `CLAUDE.md` 存在
- `.agent/index/constants.json` 存在
- `.agent/index/utils.json` 存在
- `.agent/scripts/lint.md` 存在
- 当前项目若识别为 admin，则 `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md` 存在
- 当前项目若识别为 tauri，则 `.agent/tauri/rules.md` 存在
- 当前项目若识别为 uni，则 `.agent/uni/rules.md` 存在
- 当前项目未命中 admin、tauri、uni 时，不创建对应技术栈目录
- 没有创建或修改根目录 `.gitignore`
- `.agent/README.md` 不存在
- 没有额外创建 `.agent/comment.md`、`.agent/naming.md`、`.agent/constant.md`、`.agent/api.md`、`.agent/vue.md`、`.agent/unocss.md`
- `AGENTS.md` 与 `CLAUDE.md` 没有把不存在的 `.agent/**` 文件写成强依赖
- `AGENTS.md` 与 `CLAUDE.md` 保留了参考模板主体，不会被整体改写成另一份最小文档
- 不同时创建多组技术栈目录；`admin`、`tauri`、`uni` 最多命中一组
- 如果误创建了上述文件，先删除，再回到最小初始化结果

## 索引文件要求

`.agent/index/constants.json` 至少维护：

- `name`
- `description`
- `typeName`
- `filePath`
- `values`
- `lastUpdated`

`.agent/index/utils.json` 至少维护：

- `name`
- `description`
- `filePath`
- `keywords`
- `lastUpdated`

## lint 要求

`.agent/scripts/lint.md` 至少覆盖以下内容：

- 对本次修改文件执行 lint 校验，优先按文件路径或最小范围运行，不默认全量 lint
- 检查新增或修改的常量、枚举是否已同步到 `.agent/index/constants.json`
- 检查新增或修改的公共方法、工具函数是否已同步到 `.agent/index/utils.json`
- 删除无语义缩写、临时命名和无效注释

## 输出要求

输出结果里需要明确：

- 固定初始化了 `AGENTS.md`、`CLAUDE.md`、`.agent/index/**` 与 `.agent/scripts/lint.md`
- 根据项目类型是否额外初始化了 `.agent/admin/**`、`.agent/tauri/**` 或 `.agent/uni/**`
- 没有创建或修改 `.gitignore`
- `AGENTS.md`、`CLAUDE.md` 与 `.agent/index/**`、`.agent/scripts/lint.md` 的用途
- 明确说明 `.agent/README.md` 与其它无关共享规则文件没有创建
