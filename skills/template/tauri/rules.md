<!-- aimin-skill-version: 0.1.0 -->

# Tauri 项目规则

适用于 Tauri 桌面应用开发（Rust 后端 + Vue/React 前端）。

## 项目配置

- **后端**：Rust（`src-tauri/`）
- **前端**：Vue 3 / React
- **通信**：Tauri IPC（`invoke`）
- **构建**：Vite + Tauri CLI

## 项目约束

- 不要过度封装，优先保持实现直接、可读
- 命名简单化，优先短而清晰的命名

---

## 1. 目录结构

```text
src-tauri/
├── src/
│   ├── main.rs           # 主入口
│   ├── lib.rs            # 库入口
│   ├── commands/         # IPC 命令模块
│   │   ├── mod.rs
│   │   └── {module}.rs   # 按功能拆分
│   └── utils/            # Rust 工具函数
├── capabilities/         # 权限配置
├── Cargo.toml
└── tauri.conf.json       # Tauri 配置

src/                      # 前端代码
├── api/
│   └── tauri/            # Tauri API 封装
│       └── index.ts      # invoke 调用封装
└── ...
```

---

## 2. IPC 命令规范

### 2.1 Rust 命令定义

```rust
// src-tauri/src commands/app.rs

/// 获取应用信息
#[tauri::command]
pub fn get_app_info(app: tauri::AppHandle) -> Result<AppInfo, String> {
    // ...
}

/// 保存配置
#[tauri::command]
pub fn save_config(path: String, config: serde_json::Value) -> Result<(), String> {
    // ...
}
```

### 2.2 命令注册

```rust
// src-tauri/src/lib.rs
mod commands;

fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_info,
            commands::app::save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2.3 前端调用封装

```typescript
// src/api/tauri/index.ts
import { invoke } from "@tauri-apps/api/core";

/** 通用 invoke 封装 */
async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    console.error(`invoke ${cmd}:`, error);
    throw error;
  }
}

/** 获取应用信息 */
export function getAppInfo() {
  return call<AppInfo>("get_app_info");
}

/** 保存配置 */
export function saveConfig(path: string, config: unknown) {
  return call<void>("save_config", { path, config });
}
```

---

## 3. 权限配置

在 `src-tauri/capabilities/` 中配置权限：

```json
{
  "identifier": "default",
  "permissions": [
    "core:default",
    "shell:allow-open",
    "dialog:allow-open",
    "fs:allow-read",
    "fs:allow-write"
  ]
}
```

---

## 4. 多窗口管理

```typescript
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

/** 创建新窗口 */
async function createWindow(label: string, url: string) {
  const win = new WebviewWindow(label, {
    url,
    title: "新窗口",
    width: 800,
    height: 600
  });
  return win;
}

/** 获取当前窗口 */
function getCurrentWindow() {
  return WebviewWindow.getCurrent();
}
```

---

## 5. 常用 Tauri API

| API          | 用途         | 导入路径                          |
| ------------ | ------------ | --------------------------------- |
| `invoke`     | IPC 调用     | `@tauri-apps/api/core`            |
| `WebviewWindow` | 窗口管理 | `@tauri-apps/api/webviewWindow`   |
| `open`       | 打开链接     | `@tauri-apps/plugin-shell`        |
| `openDialog` | 文件对话框   | `@tauri-apps/plugin-dialog`       |
| `readFile`   | 读文件       | `@tauri-apps/plugin-fs`           |
| `writeFile`  | 写文件       | `@tauri-apps/plugin-fs`           |

---

## 6. 注意事项

1. **类型同步**：Rust 和前端的类型定义需保持一致，建议使用 `tauri-specta` 自动生成
2. **错误处理**：Rust 命令返回 `Result<T, String>`，前端需处理异常
3. **安全边界**：敏感操作需在 `capabilities` 中声明权限
4. **调试模式**：开发时使用 `devtools`，生产环境关闭
