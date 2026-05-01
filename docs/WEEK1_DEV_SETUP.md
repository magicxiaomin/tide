# Week 1 开发环境说明

## 配置来源

本项目已读取旧仓库 `magicxiaomin/haidiao-tide-miniapp` 的微信小程序配置，并迁移到根目录 `project.config.json`。

已迁移的关键配置:

- `appid`: `touristappid`
- `projectname`: `海钓潮汐`
- `compileType`: `miniprogram`
- `libVersion`: `3.4.7`
- `setting.urlCheck`: `false`
- `setting.es6`: `true`
- `setting.enhance`: `true`
- `setting.postcss`: `true`
- `setting.minified`: `true`
- `setting.coverView`: `true`

新项目采用 `docs/TECH_STACK.md` 约定的目录:

- 小程序代码: `miniapp/`
- 云函数代码: `cloud-functions/`

## CloudBase 环境

旧仓库没有可迁移的 CloudBase 环境 ID。本项目先保留空配置:

```js
// miniapp/config/env.js
const CLOUD_ENV_ID = ''
```

拿到真实 CloudBase 环境 ID 后，只需要把它填入 `CLOUD_ENV_ID`。如果保持空字符串，微信开发者工具会使用当前小程序项目默认云环境。

## Week 1 云函数

### `hello`

路径: `cloud-functions/hello`

职责:

- 返回写死的 `message: "hello"`
- 从微信云函数上下文读取 `openid`
- 作为小程序和后端打通的第一条链路

返回示例:

```json
{
  "message": "hello",
  "openid": "微信返回的 openid",
  "appid": "微信 appid",
  "unionid": "",
  "source": "cloudbase",
  "fetched_at": "2026-04-30T00:00:00.000Z"
}
```

### `setup-db`

路径: `cloud-functions/setup-db`

职责:

- 创建 Week 1 需要的 CloudBase 集合
- 集合名单来自 `docs/DATA_MODEL.md`
- 不创建任何照片二进制或照片云存储集合

集合:

- `users`
- `fishing_spots`
- `user_spots`
- `catch_logs`
- `tide_cache`
- `weather_cache`

## 本地打开方式

1. 用微信开发者工具打开项目根目录 `D:\Projects\Haidiao`。
2. 确认云开发环境已启用。
3. 右键上传并部署云函数 `hello`。
4. 右键上传并部署云函数 `setup-db`。
5. 在云开发控制台运行一次 `setup-db`。
6. 编译小程序。

Week 1 完成标志: 启动首屏显示后端返回的 `openid`。

## 本地测试

当前系统 PATH 里的 `node.exe` 不可执行，`npm` 也不在 PATH。Codex 已使用内置 Node 跑通测试:

```powershell
& 'C:\Users\magic\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test
```
