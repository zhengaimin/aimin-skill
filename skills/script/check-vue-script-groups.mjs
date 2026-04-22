/**
 * Vue Script Setup 分组检查脚本
 * 检查 .vue 文件顶层声明的分组顺序与空行规则
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const tsParser = require("@typescript-eslint/parser");

/** 生命周期函数名称集合 */
const LIFECYCLE_NAME_SET = new Set([
  "onActivated",
  "onBeforeMount",
  "onBeforeUnmount",
  "onBeforeUpdate",
  "onDeactivated",
  "onErrorCaptured",
  "onMounted",
  "onRenderTracked",
  "onRenderTriggered",
  "onServerPrefetch",
  "onUnmounted",
  "onUpdated"
]);
/** watch 函数名称集合 */
const WATCH_NAME_SET = new Set(["watch", "watchEffect", "watchPostEffect", "watchSyncEffect"]);
/** ref/reactive 函数名称集合 */
const REF_REACTIVE_NAME_SET = new Set(["customRef", "reactive", "ref", "shallowReactive", "shallowRef"]);
/** setup 宏名称集合 */
const SETUP_MACRO_NAME_SET = new Set(["defineEmits", "defineModel", "defineProps", "defineSlots"]);
/** 分组顺序 */
const GROUP_ORDER = [
  "import-type",
  "import-vue",
  "import-api",
  "import-component",
  "import-constant",
  "import-hook",
  "import-store",
  "import-local",
  "define-options",
  "setup-macro",
  "type-definition",
  "local-const",
  "use-hook-call",
  "ref-reactive",
  "computed",
  "method",
  "axios",
  "handle",
  "accept-params",
  "lifecycle",
  "watch",
  "define-expose"
];
/** 分组中文文案 */
const GROUP_LABEL_MAP = {
  "accept-params": "acceptParams",
  axios: "axios 方法组",
  computed: "computed 组",
  "define-expose": "defineExpose",
  "define-options": "defineOptions",
  handle: "handle 方法组",
  "import-api": "接口导入组",
  "import-component": "组件导入组",
  "import-constant": "常量导入组",
  "import-hook": "Hook 导入组",
  "import-local": "本地导入组",
  "import-store": "Store 导入组",
  "import-type": "类型导入组",
  "import-vue": "Vue 导入组",
  lifecycle: "生命周期组",
  "local-const": "本地常量组",
  method: "通用方法组",
  "ref-reactive": "ref/reactive 组",
  "setup-macro": "setup 宏组",
  "type-definition": "类型定义组",
  "use-hook-call": "useXXX 调用组",
  watch: "watch 组"
};
/** 命令帮助文案 */
const HELP_TEXT = `
用法:
  node .agent/script/check-vue-script-groups.mjs <文件或目录...>

示例:
  node .agent/script/check-vue-script-groups.mjs src/views/organizationChart/enterpriseSetup/addProcesses/index.vue
  node .agent/script/check-vue-script-groups.mjs src/views/organizationChart/enterpriseSetup/addProcesses

说明:
  1. 仅检查 .vue 文件中的 <script setup>
  2. 检查顶层声明的分组顺序
  3. 检查分组之间必须保留 1 个空行，组内禁止空行
`;

/**
 * 解析命令参数
 * @returns 目标路径列表
 */
function resolveTargets() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP_TEXT.trim());
    process.exit(0);
  }

  if (args.length > 0) return args;
  return ["src/views"];
}

/**
 * 读取路径信息
 * @param target 目标路径
 * @returns 文件状态
 */
function resolveStat(target) {
  try {
    return fs.statSync(target);
  } catch {
    return null;
  }
}

/**
 * 递归收集 .vue 文件
 * @param target 目标路径
 * @param fileList 文件列表
 * @returns void
 */
function collectVueFiles(target, fileList) {
  const stat = resolveStat(target);
  if (!stat) return;

  if (stat.isFile()) {
    if (target.endsWith(".vue")) fileList.push(path.resolve(target));
    return;
  }

  if (!stat.isDirectory()) return;

  const entryList = fs.readdirSync(target, { withFileTypes: true });
  for (let i = 0; i < entryList.length; i += 1) {
    const entry = entryList[i];
    if (entry.name === "node_modules" || entry.name === ".git") continue;

    const currentPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      collectVueFiles(currentPath, fileList);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".vue")) {
      fileList.push(path.resolve(currentPath));
    }
  }
}

/**
 * 获取脚本块内容
 * @param fileContent 文件内容
 * @returns 脚本块信息
 */
function resolveScriptSetupBlock(fileContent) {
  const match = fileContent.match(/<script\b[^>]*\bsetup\b[^>]*>([\s\S]*?)<\/script>/m);
  if (!match) return null;

  const openTagMatch = match[0].match(/^<script\b[^>]*\bsetup\b[^>]*>/);
  if (!openTagMatch) return null;

  const blockStartIndex = match.index + openTagMatch[0].length;
  const startLine = fileContent.slice(0, blockStartIndex).split(/\r?\n/).length - 1;

  return {
    content: match[1],
    startLine
  };
}

/**
 * 获取调用表达式名称
 * @param node AST 节点
 * @returns 调用名称
 */
function resolveCallName(node) {
  if (!node) return "";
  if (node.type === "Identifier") return node.name;

  if (node.type === "MemberExpression" && node.property?.type === "Identifier") {
    return node.property.name;
  }

  if (node.type === "ChainExpression") {
    return resolveCallName(node.expression);
  }

  if (node.type === "CallExpression") {
    return resolveCallName(node.callee);
  }

  return "";
}

/**
 * 判断是否为 setup 宏调用
 * @param init 初始化表达式
 * @returns 是否命中
 */
function isSetupMacroInit(init) {
  if (!init || init.type !== "CallExpression") return false;

  const callName = resolveCallName(init.callee);
  if (SETUP_MACRO_NAME_SET.has(callName)) return true;

  if (callName === "withDefaults" && init.arguments?.length > 0) {
    return isSetupMacroInit(init.arguments[0]);
  }

  return false;
}

/**
 * 获取导入分组
 * @param node Import 节点
 * @returns 分组名称
 */
function resolveImportGroup(node) {
  if (node.importKind === "type") return "import-type";

  const importPath = String(node.source.value ?? "");
  if (importPath === "vue") return "import-vue";
  if (importPath.indexOf("@/") !== 0 && importPath.indexOf("./") !== 0 && importPath.indexOf("../") !== 0) return "import-vue";
  if (importPath.indexOf("@/api/modules") === 0) return "import-api";
  if (importPath.endsWith(".vue")) return "import-component";
  if (importPath.indexOf("@/config/") === 0 || importPath.indexOf("@/constants/") === 0) return "import-constant";
  if (importPath.indexOf("@/hooks/") === 0) return "import-hook";
  if (importPath.indexOf("@/stores/") === 0 || importPath.indexOf("@/store/") === 0) return "import-store";
  return "import-local";
}

/**
 * 获取变量声明分组
 * @param node VariableDeclaration 节点
 * @returns 分组名称
 */
function resolveVariableGroup(node) {
  const firstDeclaration = node.declarations?.[0];
  const declarationName = firstDeclaration?.id?.type === "Identifier" ? firstDeclaration.id.name : "";
  const init = firstDeclaration?.init;

  if (declarationName === "acceptParams") return "accept-params";
  if (declarationName.indexOf("axios") === 0) return "axios";
  if (declarationName.indexOf("handle") === 0) return "handle";

  if (isSetupMacroInit(init)) return "setup-macro";

  if (init?.type === "CallExpression") {
    const callName = resolveCallName(init.callee);

    if (callName === "computed") return "computed";
    if (REF_REACTIVE_NAME_SET.has(callName)) return "ref-reactive";
    if (callName.indexOf("use") === 0 && callName.length > 3) return "use-hook-call";
  }

  return "local-const";
}

/**
 * 获取函数声明分组
 * @param node Function 节点
 * @returns 分组名称
 */
function resolveFunctionGroup(node) {
  const functionName = node.id?.name ?? "";
  if (functionName === "acceptParams") return "accept-params";
  if (functionName.indexOf("axios") === 0) return "axios";
  if (functionName.indexOf("handle") === 0) return "handle";
  return "method";
}

/**
 * 获取表达式语句分组
 * @param node ExpressionStatement 节点
 * @returns 分组名称
 */
function resolveExpressionGroup(node) {
  const expression = node.expression;
  if (!expression || expression.type !== "CallExpression") return "unknown";

  const callName = resolveCallName(expression.callee);
  if (callName === "defineOptions") return "define-options";
  if (callName === "defineExpose") return "define-expose";
  if (WATCH_NAME_SET.has(callName)) return "watch";
  if (LIFECYCLE_NAME_SET.has(callName)) return "lifecycle";
  return "unknown";
}

/**
 * 获取节点分组
 * @param node AST 节点
 * @returns 分组名称
 */
function resolveNodeGroup(node) {
  if (!node) return "unknown";

  if (node.type === "ImportDeclaration") return resolveImportGroup(node);
  if (node.type === "ExpressionStatement") return resolveExpressionGroup(node);
  if (node.type === "FunctionDeclaration") return resolveFunctionGroup(node);
  if (node.type === "VariableDeclaration") return resolveVariableGroup(node);
  if (node.type === "TSInterfaceDeclaration" || node.type === "TSTypeAliasDeclaration" || node.type === "TSEnumDeclaration") {
    return "type-definition";
  }

  return "unknown";
}

/**
 * 获取分组排序值
 * @param group 分组名称
 * @returns 排序值
 */
function resolveGroupOrder(group) {
  const index = GROUP_ORDER.indexOf(group);
  if (index >= 0) return index;
  return Number.MAX_SAFE_INTEGER;
}

/**
 * 统计两个节点之间的空行数
 * @param lineList 行列表
 * @param prevNode 前一个节点
 * @param nextNode 后一个节点
 * @returns 空行数
 */
function resolveEmptyLineCount(lineList, prevNode, nextNode) {
  const betweenLineList = lineList.slice(prevNode.loc.end.line, nextNode.loc.start.line - 1);
  let emptyLineCount = 0;

  for (let i = 0; i < betweenLineList.length; i += 1) {
    if (betweenLineList[i].trim() === "") emptyLineCount += 1;
  }

  return emptyLineCount;
}

/**
 * 校验脚本块
 * @param filePath 文件路径
 * @param scriptContent 脚本内容
 * @param scriptStartLine 脚本起始行
 * @returns 问题列表
 */
function checkScriptGroups(filePath, scriptContent, scriptStartLine) {
  const issueList = [];
  const lineList = scriptContent.split(/\r?\n/);
  let ast;

  try {
    ast = tsParser.parse(scriptContent, {
      comment: true,
      ecmaVersion: 2020,
      loc: true,
      range: true,
      sourceType: "module"
    });
  } catch (error) {
    const line = scriptStartLine + (error.lineNumber ?? 1);
    issueList.push(`${filePath}:${line} 脚本解析失败: ${error.message}`);
    return issueList;
  }

  const nodeList = [];
  for (let i = 0; i < ast.body.length; i += 1) {
    const node = ast.body[i];
    const group = resolveNodeGroup(node);
    nodeList.push({
      group,
      loc: node.loc,
      node
    });
  }

  let prevKnownGroupNode = null;

  for (let i = 0; i < nodeList.length; i += 1) {
    const currentNode = nodeList[i];
    if (currentNode.group === "unknown") continue;

    if (prevKnownGroupNode) {
      const prevOrder = resolveGroupOrder(prevKnownGroupNode.group);
      const currentOrder = resolveGroupOrder(currentNode.group);

      if (currentOrder < prevOrder) {
        const currentLine = scriptStartLine + currentNode.loc.start.line;
        issueList.push(
          `${filePath}:${currentLine} 分组顺序错误: ${GROUP_LABEL_MAP[currentNode.group] || currentNode.group} 不应出现在 ${GROUP_LABEL_MAP[prevKnownGroupNode.group] || prevKnownGroupNode.group} 之后`
        );
      }

      const emptyLineCount = resolveEmptyLineCount(lineList, prevKnownGroupNode, currentNode);
      const currentLine = scriptStartLine + currentNode.loc.start.line;

      if (currentNode.group === prevKnownGroupNode.group && emptyLineCount !== 0) {
        issueList.push(
          `${filePath}:${currentLine} 组内禁止空行: ${GROUP_LABEL_MAP[currentNode.group] || currentNode.group} 内部当前存在 ${emptyLineCount} 个空行`
        );
      }

      if (currentNode.group !== prevKnownGroupNode.group && emptyLineCount !== 1) {
        issueList.push(
          `${filePath}:${currentLine} 分组之间必须保留 1 个空行: ${GROUP_LABEL_MAP[prevKnownGroupNode.group] || prevKnownGroupNode.group} 与 ${GROUP_LABEL_MAP[currentNode.group] || currentNode.group} 之间当前存在 ${emptyLineCount} 个空行`
        );
      }
    }

    prevKnownGroupNode = currentNode;
  }

  return issueList;
}

/**
 * 检查单个 Vue 文件
 * @param filePath 文件路径
 * @returns 问题列表
 */
function checkVueFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const scriptBlock = resolveScriptSetupBlock(fileContent);
  if (!scriptBlock) return [];

  return checkScriptGroups(filePath, scriptBlock.content, scriptBlock.startLine);
}

/**
 * 主执行函数
 * @returns void
 */
function main() {
  const targetList = resolveTargets();
  const fileList = [];

  for (let i = 0; i < targetList.length; i += 1) {
    collectVueFiles(targetList[i], fileList);
  }

  if (fileList.length === 0) {
    console.error("未找到可检查的 .vue 文件");
    process.exit(1);
  }

  const issueList = [];
  for (let i = 0; i < fileList.length; i += 1) {
    const currentIssueList = checkVueFile(fileList[i]);
    for (let j = 0; j < currentIssueList.length; j += 1) {
      issueList.push(currentIssueList[j]);
    }
  }

  if (issueList.length === 0) {
    console.log(`检查通过，共检查 ${fileList.length} 个 .vue 文件`);
    process.exit(0);
  }

  for (let i = 0; i < issueList.length; i += 1) {
    console.error(issueList[i]);
  }

  console.error(`检查失败，共发现 ${issueList.length} 个问题`);
  process.exit(1);
}

main();
