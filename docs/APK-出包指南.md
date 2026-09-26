# APK 出包指南

> 法考主观题速记 Android 版（Capacitor 7 + React 18 + Vite 5，完全离线）
> 本机无需安装 JDK / Android Studio / Gradle —— 默认走 **GitHub Actions 云构建**。

## 路径一（推荐）：GitHub Actions 云构建，3 步出包

1. **推送代码**
   ```bash
   git push origin main
   ```
   推送包含 `faka-android/**` 或 `shared/**` 的提交后，`.github/workflows/build-apk.yml` 自动触发
   （也可在 GitHub 仓库 Actions 页面手动 Run workflow）。

2. **等待构建完成**
   流程：npm install（npmmirror）→ tsc + vite build → cap sync android → Temurin JDK 17 →
   `./gradlew assembleDebug`。首次约 5–8 分钟，后续有缓存约 3–5 分钟。

3. **下载 APK**
   仓库页 → Actions → 本次运行 → Artifacts → `faka-zhuguan-debug-apk`（zip 内含 `app-debug.apk`）。
   手机直接安装（设置允许安装未知来源），或发给别人安装。

> debug 包可直接长期使用；如需上架/签名发布版，在 workflow 的 assembleDebug 前配置
> keystore 环境变量并改跑 `assembleRelease`（见"常见失败"第 5 条）。

## 路径二：PWA 安装（无需 APK）

Web 产物（`faka-android/dist/`）是完全独立的 PWA，三条兜底发布路径：

1. **任意静态托管**：把 `dist/` 整体上传（GitHub Pages / Vercel / Netlify / 云开发静态托管均可，
   注意必须是 **HTTPS**），手机浏览器打开 → 菜单"添加到主屏幕"，即获独立窗口的全屏应用。
2. **本地局域网验证**：`npm run preview -- --host`，手机同网访问提示地址。
   注意 PWA 安装与 Service Worker 要求 HTTPS（localhost 除外）。
3. **离线能力**：手写 `public/sw.js` 已实现 App Shell 预缓存 + 导航回退，
   首次打开后断网仍可完整使用（数据存本机 localStorage/IndexedDB 层）。

## 路径三（最后手段）：HBuilderX 本地打包

完全没有网络 CI 可用时：

1. 用 HBuilderX 新建"5+App/wap2app"项目，网站地址指向已部署的 PWA 地址（路径二第 1 步）；
2. 云打包时勾选"Android"、"传统打包"，权限清单**只保留通知**（应用本体零权限，勿勾网络）；
3. 得到壳 APK。功能与体验不如 Capacitor 壳（无 adjustResize 精细适配），仅作应急。

## 常见失败与处理

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| Actions 里 `npm install` 超时 | 默认 registry 慢 | workflow 已内置 `npm config set registry https://registry.npmmirror.com`；仍超时重跑一次 |
| `Could not resolve all files for configuration` | Gradle 依赖下载抖动 | 重跑 workflow； Gradle 走官方源，偶发网络抖动 |
| `SDK location not found` | gradle 未自动装 SDK | 正常情况 `gradlew` 会自动下载；若 runner 磁盘异常，重跑 |
| `cap sync` 后 APK 仍是旧页面 | 忘了先 build | 顺序必须是 `npm run build` → `npx cap sync android` → gradle（workflow 已固定） |
| 需要正式签名包 | debug 签名不能上架 | 生成 keystore：`keytool -genkey -v -keystore faka.keystore -alias faka -keyalg RSA -keysize 2048 -validity 10000`；在 repo secrets 配置 `KEYSTORE_BASE64 / KEYSTORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD`，workflow 加 `unzip → signingReport` 步骤改跑 `assembleRelease` |
| 手机安装报"解析失败" | 下载不完整 / 旧安卓 32 位 | 重新下载 artifact；本应用 minSdk 由 Capacitor 7 默认 23（Android 6+） |
| 通知提醒不弹 | 系统通知权限被拒 | 系统设置 → 应用 → 通知权限打开；应用内设置页重新开关一次"每日背诵提醒" |

## 本地开发与验证（无 Android SDK 也能做）

- `npm run dev`：浏览器开发预览（含全部页面功能，PWA 行为一致）；
- `npm test`（faka-android 内执行，等价于在仓库根运行 `node tools/smoke-test-android.mjs`——
  测试脚本位于**仓库根** `tools/` 目录，不在 faka-android/tools/ 下）：跑 62 项逻辑等价冒烟测试
  （数据/间隔数组/命中判定/存储/路由栈）；
- `npm run build`：tsc 严格检查 + vite 产物；
- `npx cap sync android`：把 dist 与插件同步进 android/ 壳（提交 android/ 目录，U-10 全量入库）。

## 合规提醒

应用与所有数据产物均带免责声明（启动弹层 / 首页页脚 / 案例页 / 关于页）：
内容依据公开备考资料整理，考试日期、政策等以司法部官方公告为准；应用零网络权限、零数据上传。
