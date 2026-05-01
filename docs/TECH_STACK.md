# 技术栈与目录结构

## 技术选型

### 前端(微信小程序)

- **原生小程序框架**(WXML + WXSS + JS)
- 不引入 Taro / Uni-app(避免学习成本和兼容问题)
- UI 库:**不引入**(自己写,保证轻量)
- 图表:**自己用 SVG 或 Canvas 画**(潮汐波形图)

### 后端(推荐方案)

- **腾讯云 CloudBase + Node.js 云函数**
  - 理由:小程序生态深度集成,免备案,免费额度够 MVP 用
  - 文档:https://docs.cloudbase.net/

### 后端(备选方案)

- **Python FastAPI + 阿里云轻量服务器**
  - ¥30-60/月
  - 需要域名 ICP 备案(20-30 天周期)
  - 自由度最高,但启动周期长

### 数据库

- CloudBase:MongoDB-compatible(文档型)
- 自建:PostgreSQL 或 MySQL

### 第三方 API

- 和风天气(国内最稳):https://dev.qweather.com
- WorldTides 或 国家海洋预报台:潮汐
- 不需要月相 API(后端用 `pyephem` 或 `astral` 计算)

---

## 小程序目录结构

```
miniapp/
├── app.js                    # 小程序入口,全局逻辑
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── pages/
│   ├── splash/               # 屏 1
│   ├── onboarding-intro/     # 屏 2
│   ├── onboarding-spot/      # 屏 3
│   ├── home/                 # 屏 4(主屏)
│   ├── forecast/             # 屏 5(七日)
│   ├── spots/                # 屏 6(钓点管理)
│   ├── catch-log/            # 屏 7(记录表单)
│   ├── catch-card/           # 屏 8(渔获卡 + 分享)
│   └── my-catches/           # 屏 9(渔获列表)
├── components/
│   ├── tide-curve/           # 潮汐波形图(主屏 + 七日)
│   ├── tide-curve-mini/      # 七日预报里的迷你波形
│   ├── data-block/           # 双列数据块(风/天气、气压/月相)
│   └── catch-card-canvas/    # 渔获卡 Canvas 合成
├── utils/
│   ├── api.js                # 后端调用封装
│   ├── cache.js              # 本地缓存(wx.setStorage)
│   ├── geo.js                # 定位授权封装
│   └── auth.js               # 微信登录封装
└── assets/
    └── icons/                # 图标 SVG
```

## 后端目录结构(以 CloudBase 云函数为例)

```
cloud-functions/
├── data-today/               # GET /data/today
├── data-forecast/            # GET /data/forecast
├── catches-create/           # POST /catches
├── catches-list/             # GET /catches
├── spots-nearby/             # GET /spots/nearby
├── user-spots-list/          # GET /user_spots
├── user-onboard/             # POST /users/onboard
└── shared/
    ├── tide-fetcher.js       # 潮汐数据抓取与缓存
    ├── weather-fetcher.js    # 天气
    ├── moon-calculator.js    # 月相计算
    └── db.js                 # 数据库操作封装
```

---

## 关键技术决策

### 1. 图表用 SVG 还是 Canvas?

| 场景 | 选择 | 原因 |
|------|------|------|
| 主屏潮汐波形 | **SVG** | 静态展示,样式调整方便 |
| 七日迷你波形 | **SVG** | 同上 |
| 渔获卡合成 | **Canvas** | 必须用 `canvasToTempFilePath` 才能保存图片 |

### 2. 缓存策略

- 主屏数据:本地缓存 6 小时(`wx.setStorage`)
- 钓点列表:本地缓存 7 天
- 用户渔获:不缓存(每次拉取)

### 3. 照片处理流程

```
用户拍照
  ↓
wx.chooseMedia → 临时文件路径(tmpFiles)
  ↓
路径保存到表单 state(不上传服务器)
  ↓
Canvas 合成时,wx.getImageInfo 加载该路径
  ↓
合成后 wx.canvasToTempFilePath 拿到新路径
  ↓
wx.saveImageToPhotosAlbum 保存到系统相册
```

**关键约束**:照片路径只在当前小程序会话有效,不能持久化。如果要保存历史照片,**必须由用户主动保存到相册**。

### 4. 微信小程序的几个限制(必须知道)

- ❌ 不能直接分享到朋友圈(只能分享给好友)
  - 解决:引导用户从相册手动发朋友圈
- ⚠️ 域名必须配置白名单(在小程序后台)
- ⚠️ 个人主体小程序不能开通微信支付(企业主体可以)
  - 影响:Month 7+ 的付费功能,需要切换到企业主体
- ⚠️ 启动有 1-3 秒冷启动时间,要做好骨架屏
- ⚠️ 单个云函数响应时间限制 20s,潮汐/天气拉取要做好超时

---

## 启动检查清单

在写第一行代码之前:

- [ ] 微信公众平台注册小程序账号
- [ ] 选择主体类型(个人 / 企业)并确认类目
- [ ] 拿到 AppID
- [ ] 注册腾讯云 CloudBase(或选择备选方案)
- [ ] 注册和风天气开发者账号,拿 API key
- [ ] 选定潮汐数据源,确认能拿到目标钓点的潮汐
- [ ] 装好微信开发者工具
- [ ] Hello World 跑通(小程序 → 云函数 → 返回)
