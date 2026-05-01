# 后端 API 接口清单

所有接口前缀:`/api/v1`
认证:微信 openid(每次请求带 header `X-Openid`)

---

## 1. 用户

### POST `/users/onboard`

完成 onboarding,记录用户基础信息

**请求**:
```json
{ "nickname": "可选" }
```

**返回**:
```json
{ "openid": "...", "onboarded_at": "..." }
```

---

## 2. 钓点

### GET `/spots/nearby?lat=&lng=&radius=10`

返回附近钓点(系统库 + 用户自定义)

**返回**:
```json
{
  "spots": [
    {
      "id": 1,
      "name": "XX 礁",
      "distance_km": 3.2,
      "fishing_style": "矶钓,船钓",
      "latitude": 22.123,
      "longitude": 114.456
    }
  ]
}
```

### POST `/spots`

用户自定义新钓点

**请求**:
```json
{
  "name": "...",
  "latitude": ...,
  "longitude": ...,
  "fishing_style": "..."
}
```

### GET `/user_spots`

用户的收藏钓点

**返回**:
```json
{
  "spots": [...],
  "active_spot_id": 1
}
```

### POST `/user_spots/activate/{spot_id}`

设置当前激活钓点

---

## 3. 数据(主屏 / 七日预报)

### GET `/data/today?spot_id=`

返回该钓点今日完整数据(主屏用)

**返回**:
```json
{
  "date": "2026-04-28",
  "tide_type": "大潮第2天",
  "tide_curve": [
    { "time": "00:00", "height": 1.2 },
    ...
  ],
  "tide_extremes": [
    { "type": "low",  "time": "04:12", "height": 0.2 },
    { "type": "high", "time": "10:38", "height": 4.8 },
    { "type": "low",  "time": "16:50", "height": 0.4 },
    { "type": "high", "time": "23:04", "height": 4.3 }
  ],
  "tide_range": 4.6,
  "wind": {
    "direction": "东北",
    "level": 4,
    "gust_level": 5,
    "vs_spot_orientation": "背风面"
  },
  "weather": {
    "description": "多云转晴",
    "temp_min": 17,
    "temp_max": 22,
    "water_temp": 18.3
  },
  "pressure": {
    "current": 1018,
    "trend_24h": 3,
    "direction": "up"
  },
  "moon": {
    "phase_text": "满月前 1 天",
    "moonrise": "18:42"
  },
  "sun": {
    "sunrise": "05:24",
    "sunset": "18:46"
  },
  "common_species": ["真鲷", "黑鲷", "鲈鱼", "石斑"],
  "fetched_at": "2026-04-28 14:32:00"
}
```

### GET `/data/forecast?spot_id=&days=7`

返回未来 7 天数据(七日预报屏用)

**返回**:
```json
{
  "days": [
    {
      "date": "2026-04-28",
      "tide_type": "大潮",
      "tide_curve_simple": [...],
      "wind": { "direction": "东北", "level": 4 },
      "weather_emoji": "☀️",
      "temp_max": 17
    },
    ...
  ]
}
```

---

## 4. 渔获

### POST `/catches`

创建渔获记录(**不上传照片!**)

**请求**:
```json
{
  "spot_id": 1,
  "started_at": "2026-04-28 06:00",
  "ended_at": "2026-04-28 12:30",
  "species": [
    { "name": "真鲷", "count": 2, "max_kg": 1.8 }
  ],
  "bait": "南极虾",
  "note": "...",
  "photo_count": 2
}
```

**返回**:
```json
{
  "id": 123,
  "weather_snapshot": {
    "tide_type": "大潮第 2 天",
    "wind": {...},
    "weather": {...}
  }
}
```

**后端必做**:服务器在创建时,自动从缓存或现拉取那一刻的潮汐/天气/气压/月相,保存到 `weather_snapshot_json`。

### GET `/catches?page=1&size=20`

用户的渔获列表

**返回**:
```json
{
  "catches": [
    {
      "id": 123,
      "spot_name": "XX 礁",
      "started_at": "...",
      "species_summary": "真鲷 ×2 · 黑鲷 ×1",
      "weather_summary": "大潮 · 东北 4 级 · 南极虾"
    }
  ],
  "total": 47,
  "page": 1
}
```

### GET `/catches/{id}`

渔获详情(完整数据)

### GET `/users/me/stats`

用户统计

**返回**:
```json
{
  "total_trips": 47,
  "species_count": 23,
  "total_fish": 128
}
```

---

## 5. 第三方数据源(后端集成,前端不直接调)

| 数据 | 推荐服务 | 备注 |
|------|---------|------|
| 潮汐 | WorldTides API / 国家海洋局 | WorldTides 有付费免费版,国内用国家海洋预报台 |
| 天气 | 和风天气 API | 国内最稳,有免费档 |
| 气压 | OpenWeatherMap / 和风天气 | 注意要 24h 历史数据计算趋势 |
| 月相 | Python `astral` 库本地计算 | 不需要 API,完全本地算 |

后端定时(每 6 小时)预拉取所有热门钓点数据,存入 `tide_cache` 和 `weather_cache`,小程序请求时优先返回缓存。

---

## 错误处理统一规范

所有接口失败时返回:
```json
{
  "error": {
    "code": "TIDE_API_UNAVAILABLE",
    "message": "潮汐数据服务暂时不可用,请稍后重试",
    "retryable": true
  }
}
```

错误码列表(MVP 阶段):
- `LOCATION_DENIED` - 用户拒绝定位授权
- `SPOT_NOT_FOUND` - 钓点不存在
- `TIDE_API_UNAVAILABLE` - 潮汐 API 失败
- `WEATHER_API_UNAVAILABLE` - 天气 API 失败
- `INVALID_INPUT` - 参数错误
- `UNAUTHORIZED` - openid 缺失或无效
