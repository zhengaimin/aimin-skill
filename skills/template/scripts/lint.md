<!-- aimin-skill-version: 0.1.0 -->

# lint SOP

交付前按以下顺序做收尾检查。

## 默认检查

1. 对本次修改文件执行 lint 校验，优先按文件路径或最小范围运行，不默认全量 lint
2. 检查新增或修改的常量、枚举是否已同步到 `.agent/index/constants.json`
3. 检查新增或修改的公共方法、工具函数是否已同步到 `.agent/index/utils.json`
4. 删除无语义缩写、临时命名和无效注释
