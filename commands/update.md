# 目标

`/am:update` 专门升级当前项目中的 `.agent/**` 与 `AGENTS.md`。

## 执行原则

1. 先检查当前仓库现状，再读取已安装参考模板。
2. 只处理以下目标：
   - `AGENTS.md`
   - `.agent/api.md`
   - `.agent/comment.md`
   - `.agent/naming.md`
   - `.agent/index/constants.json`
   - `.agent/index/utils.json`
   - `.agent/scripts/lint.md`
   - 当前项目主类型命中的 `.agent/admin/**`、`.agent/tauri/rules.md` 或 `.agent/uni/rules.md`
3. 不更新 `CLAUDE.md`。
4. `.agent/**` 目标文件按版本号升级：目标缺少版本号或版本号与参考文件不一致时，直接用参考文件强制覆盖。
5. `AGENTS.md` 只更新 `# Aimin-skill` 顶级标题下的受管段落；项目独有的其它顶级标题、规则和内容不要改动。
6. 如果 `AGENTS.md` 不存在，按参考模板创建；如果存在但没有 `# Aimin-skill` 段落，只追加该段落。
7. 识别项目类型时优先看真实仓库特征：
   - admin：存在后台管理目录结构、`src/views/**`、`src/api/modules/**`、Element Plus / ProTable / admin 约定
   - tauri：存在 `src-tauri/`、`tauri.conf.json`、`Cargo.toml`、`@tauri-apps/*`
   - uni：存在 `pages.json`、`manifest.json`、`uni_modules/`、`uni.*` API
8. `admin`、`tauri`、`uni` 最多命中一组；未命中时不创建对应技术栈目录。
9. 不创建或修改根目录 `.gitignore`。
10. 不创建 `.agent/README.md`，也不要创建 `.agent/constant.md`、`.agent/vue.md`、`.agent/unocss.md`。

## 版本规则

- Markdown 规则文件版本号使用 `<!-- aimin-skill-version: x.y.z -->`。
- JSON 索引文件版本号使用顶层 `version` 字段。
- 版本不一致时，以已安装参考模板为准强制更新项目侧 `.agent/**` 文件。
- `AGENTS.md` 的版本检查只用于定位 `# Aimin-skill` 受管段落，不允许覆盖项目独有规则。

## 硬性验收

升级完成前必须满足：

- `.agent/api.md` 存在且版本与参考文件一致
- `.agent/comment.md` 存在且版本与参考文件一致
- `.agent/naming.md` 存在且版本与参考文件一致
- `.agent/index/constants.json` 存在且 `version` 与参考文件一致
- `.agent/index/utils.json` 存在且 `version` 与参考文件一致
- `.agent/scripts/lint.md` 存在且版本与参考文件一致
- 当前项目若识别为 admin，则 `.agent/admin/rules.md`、`.agent/admin/table.md`、`.agent/admin/modal.md` 存在且版本与参考文件一致
- 当前项目若识别为 tauri，则 `.agent/tauri/rules.md` 存在且版本与参考文件一致
- 当前项目若识别为 uni，则 `.agent/uni/rules.md` 存在且版本与参考文件一致
- `AGENTS.md` 只更新了 `# Aimin-skill` 受管段落
- 没有创建或修改 `.gitignore`
- `.agent/README.md` 不存在

## 输出要求

输出结果里需要明确：

- 哪些 `.agent/**` 文件因版本不一致被强制更新
- 哪些 `.agent/**` 文件版本一致而跳过
- `AGENTS.md` 是否创建、追加或只更新了 `# Aimin-skill` 段落
- 根据项目类型是否额外升级了 `.agent/admin/**`、`.agent/tauri/**` 或 `.agent/uni/**`
- 没有创建或修改 `.gitignore`
