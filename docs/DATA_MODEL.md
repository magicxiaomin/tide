# 数据模型

## 设计原则

- **照片(二进制)→ 用户手机本地相册,不进数据库**
- **结构化数据 → 服务器数据库**
- 用微信 openid 作为用户唯一标识(不需要单独注册)
- 后端只做"轻量结构化数据"的承载

## 数据库表结构(腾讯云 CloudBase / MySQL / PostgreSQL 通用)

### `users`

| 字段          | 类型             | 说明                       |
| ------------- | ---------------- | -------------------------- |
| openid        | VARCHAR(64) PK   | 微信 openid                |
| nickname      | VARCHAR(64)      | 可选,用于渔获卡个性化     |
| created_at    | DATETIME         | 首次进入时间               |
| onboarded_at  | DATETIME         | 完成 onboarding 的时间     |

---

### `fishing_spots`(钓点字典 + 用户自定义钓点)

| 字段              | 类型             | 说明                                         |
| ----------------- | ---------------- | -------------------------------------------- |
| id                | BIGINT PK        |                                              |
| owner_openid      | VARCHAR(64)      | NULL 表示系统钓点                            |
| name              | VARCHAR(128)     | 钓点名                                       |
| latitude          | DECIMAL(10,7)    |                                              |
| longitude         | DECIMAL(10,7)    |                                              |
| fishing_style     | VARCHAR(64)      | 矶钓/船钓/防波堤等(逗号分隔)               |
| coast_orientation | VARCHAR(16)      | 钓点朝向(用于判断风的顺/背)                |
| created_at        | DATETIME         |                                              |

---

### `user_spots`(用户收藏的钓点)

| 字段        | 类型           | 说明                              |
| ----------- | -------------- | --------------------------------- |
| id          | BIGINT PK      |                                   |
| openid      | VARCHAR(64)    |                                   |
| spot_id     | BIGINT         | FK → fishing_spots.id             |
| custom_name | VARCHAR(128)   | 用户备注名(NULL 用 spot.name)   |
| sort_order  | INT            | 排序                              |
| is_active   | BOOLEAN        | 是否当前激活                      |
| created_at  | DATETIME       |                                   |

---

### `catch_logs`(渔获记录)

| 字段                    | 类型           | 说明                                                          |
| ----------------------- | -------------- | ------------------------------------------------------------- |
| id                      | BIGINT PK      |                                                               |
| openid                  | VARCHAR(64)    |                                                               |
| spot_id                 | BIGINT         |                                                               |
| started_at              | DATETIME       | 出海开始时间                                                  |
| ended_at                | DATETIME       | 回港时间                                                      |
| species_json            | TEXT           | JSON: `[{"name":"真鲷","count":2,"max_kg":1.8}]`              |
| bait                    | VARCHAR(64)    | 用饵                                                          |
| note                    | TEXT           | 备注                                                          |
| weather_snapshot_json   | TEXT           | JSON: 当时的潮汐/风/气压等快照                                |
| photo_local_paths_json  | TEXT           | JSON: 本地路径(只在用户当前设备有效)                        |
| created_at              | DATETIME       |                                                               |

---

### `tide_cache`(潮汐数据缓存,降低 API 调用)

| 字段           | 类型      | 说明                |
| -------------- | --------- | ------------------- |
| spot_id        | BIGINT    | PK1                 |
| date           | DATE      | PK2                 |
| tide_data_json | TEXT      | 完整 24h 潮汐数据   |
| fetched_at     | DATETIME  | 拉取时间            |

---

### `weather_cache`(天气缓存,同上)

| 字段              | 类型      | 说明 |
| ----------------- | --------- | ---- |
| spot_id           | BIGINT    | PK1  |
| date              | DATE      | PK2  |
| weather_data_json | TEXT      |      |
| fetched_at        | DATETIME  |      |

---

## 数据流图

```
┌──────────────┐
│  小程序前端    │
│              │
│  - 表单数据    │ ─────POST 文字数据────▶ ┌───────────┐
│  - 本地照片路径 │                         │  后端       │
│  - Canvas合成 │ ◀─── GET 潮汐/天气 ───── │            │
│              │                         └─────┬─────┘
└──────┬───────┘                               │
       │                                       ▼
       │                                ┌──────────────┐
       │                                │   数据库      │
       │                                │ (无照片字段)  │
       │                                └──────────────┘
       │
       │  照片只在这条线上流动,从不离开用户设备
       ▼
┌──────────────┐
│  系统相册     │
│ (微信 / 手机) │
└──────────────┘
```

## 关键设计决策

### 为什么 species 用 JSON 而不是单独建表?

- 一次出海的渔获种类不多(通常 1-5 种)
- 不需要按鱼种做复杂的跨用户统计(MVP 阶段)
- JSON 更灵活,后期加字段(如鱼的尺寸、性别等)不用改 schema

### 为什么 weather_snapshot 也用 JSON?

- 出海当时的天气快照是不可变的历史数据
- 不需要查询某个字段(只整体读出展示)
- 减少 join,简化查询

### 为什么照片只存本地路径?

- **法律合规**:服务器存了用户照片,就要做内容审核(违规图片你负责)
- **成本控制**:照片大,云存储费用持续增长
- **隐私承诺**:这是产品的核心信任壁垒
- **代价**:用户换手机会丢照片 → 在 UI 上明确告知
