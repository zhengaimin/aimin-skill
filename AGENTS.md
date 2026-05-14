# Aimin-skill

## 规则维护

- 修改 `skills/**/*.md` 时，必须同步更新该文件对应的版本号。

## 项目级别规则

| 修改范围 | 对应归档文档 | 读取要求 | 备注 |
| --- | --- | --- | --- |
| 修改 `/am:archive` 命令、归档提示词、路由文案 | `.agents/archive/features/am-archive.md` | 修改前必读 | 先读文档和当前用户 prompt，确认后再改代码，改完回写关键变更 |
| 修改关键功能点、页面或模块 | `.agents/archive/features/*.md` / `.agents/archive/pages/*.md` | 修改前必读 | 先去 `.agents/archive/xxx` 查找对应文档，再决定是否修改代码 |
| 处理会话总结与阶段回顾 | `.agents/archive/sessions/*.md` | 按需读取 | 只整理已确认信息，不写代码实现 |
| 读取客户、后台、产品方原始资料 | `.agents/docs/**` | 只读 | 原始资料不作为归档结果 |
