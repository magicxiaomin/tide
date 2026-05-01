# Week 2 数据源说明

## 已实现内容

Week 2 的本地代码已完成以下链路:

- `cloud-functions/data-today`: 聚合今日数据
- `cloud-functions/shared/tide-fetcher.js`: 潮汐数据解析与获取
- `cloud-functions/shared/weather-fetcher.js`: 天气、气压、水温解析与获取
- `cloud-functions/shared/moon-calculator.js`: 本地月相计算
- `miniapp/utils/api.js`: 小程序调用 `data-today`
- `miniapp/pages/home`: 展示今日原始数据和数据来源

小程序不会直接调用第三方数据源，所有第三方请求都在 CloudBase 云函数内完成。

## 数据源策略

### 潮汐

优先使用 WorldTides v3:

```text
https://www.worldtides.info/api/v3?heights&extremes&date=YYYY-MM-DD&lat=...&lon=...&days=1&key=...
```

WorldTides 返回 `heights` 和 `extremes` 后，后端转换为:

- `tide_curve`
- `tide_extremes`
- `tide_range`

如果没有配置 `WORLDTIDES_API_KEY`，后端会临时使用 Open-Meteo Marine 的 `sea_level_height_msl` 作为开发兜底。Open-Meteo 官方说明该数据不能替代航海历，近岸精度有限，所以正式内测前仍应配置 WorldTides 或国家海洋数据源。

使用 Open-Meteo 数据时，后续产品说明或关于页需要标明 Open-Meteo 及其数据来源归因。

### 天气与气压

优先使用 QWeather 实时天气:

```text
GET /v7/weather/now?location=lng,lat&lang=zh&unit=m
Authorization: Bearer <QWEATHER_JWT>
```

后端读取:

- `now.text`
- `now.temp`
- `now.windDir`
- `now.windScale`
- `now.windSpeed`
- `now.pressure`

如果没有配置 QWeather，后端会返回 `天气源未配置`，主屏会如实展示空值，不给任何判断或建议。

### 水温

使用 Open-Meteo Marine 的 `sea_surface_temperature`:

```text
https://marine-api.open-meteo.com/v1/marine?latitude=...&longitude=...&current=sea_surface_temperature&hourly=sea_surface_temperature&timezone=auto&forecast_days=1
```

### 月相

月相在后端本地计算，不依赖外部 API。当前返回:

- `phase_text`: `满月前 N 天` 或 `满月后 N 天`
- `moonrise`: 空字符串

`moonrise` 后续可在 Week 3 或 Week 4 结合天文数据源补齐。

## CloudBase 环境变量

在 CloudBase 云函数环境中配置:

```text
WORLDTIDES_API_KEY=你的 WorldTides key
QWEATHER_API_HOST=你的 QWeather API Host
QWEATHER_JWT=你的 QWeather JWT
```

`QWEATHER_API_HOST` 不应包含尾部斜杠。

## 部署顺序

1. 上传并部署 `cloud-functions/hello`。
2. 上传并部署 `cloud-functions/setup-db`。
3. 在云开发控制台运行一次 `setup-db`。
4. 上传并部署 `cloud-functions/data-today`。
5. 在微信开发者工具编译小程序。
6. 打开 Splash，确认显示 `openid`。
7. 点击「查看今日数据」，确认主屏显示潮汐、天气、气压、水温、月相和来源。

## 官方接口依据

- WorldTides v3 文档说明 `heights`、`extremes`、`lat`、`lon`、`date`、`days`、`key` 等参数。
- QWeather 实时天气文档说明 `/v7/weather/now`，位置参数为经纬度，响应中包含温度、风、气压等字段。
- Open-Meteo Marine 文档说明 `/v1/marine` 支持 `sea_surface_temperature` 和 `sea_level_height_msl`。
