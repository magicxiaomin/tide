const assert = require('node:assert/strict')
const test = require('node:test')

const {
  buildWorldTidesUrl,
  normalizeWorldTidesResponse,
  normalizeOpenMeteoTideResponse
} = require('../../cloud-functions/shared/tide-fetcher')
const {
  buildOpenMeteoForecastUrl,
  buildQWeatherNowUrl,
  normalizeOpenMeteoForecastResponse,
  normalizeQWeatherNow,
  normalizeOpenMeteoMarineResponse
} = require('../../cloud-functions/shared/weather-fetcher')
const { calculateMoon } = require('../../cloud-functions/shared/moon-calculator')

test('buildWorldTidesUrl requests heights and extremes for one date', () => {
  const url = buildWorldTidesUrl({
    lat: 29.9857,
    lng: 122.2072,
    date: '2026-05-01',
    days: 1,
    key: 'world-key'
  })

  assert.equal(
    url,
    'https://www.worldtides.info/api/v3?heights&extremes&date=2026-05-01&lat=29.9857&lon=122.2072&days=1&key=world-key'
  )
})

test('normalizeWorldTidesResponse converts heights and extremes to TideTai fields', () => {
  const tide = normalizeWorldTidesResponse({
    heights: [
      { date: '2026-05-01T00:00+0800', height: 1.2 },
      { date: '2026-05-01T01:00+0800', height: 1.7 },
      { date: '2026-05-01T02:00+0800', height: 1.1 }
    ],
    extremes: [
      { type: 'Low', date: '2026-05-01T04:12+0800', height: 0.2 },
      { type: 'High', date: '2026-05-01T10:38+0800', height: 4.8 }
    ]
  })

  assert.deepEqual(tide.tide_curve, [
    { time: '00:00', height: 1.2 },
    { time: '01:00', height: 1.7 },
    { time: '02:00', height: 1.1 }
  ])
  assert.deepEqual(tide.tide_extremes, [
    { type: 'low', time: '04:12', height: 0.2 },
    { type: 'high', time: '10:38', height: 4.8 }
  ])
  assert.equal(tide.tide_range, 4.6)
  assert.equal(tide.source, 'worldtides')
})

test('normalizeOpenMeteoTideResponse converts sea level hourly data and derives extremes', () => {
  const tide = normalizeOpenMeteoTideResponse({
    hourly: {
      time: ['2026-05-01T00:00', '2026-05-01T01:00', '2026-05-01T02:00', '2026-05-01T03:00'],
      sea_level_height_msl: [0.8, 1.4, 1.0, 0.6]
    }
  })

  assert.deepEqual(tide.tide_curve, [
    { time: '00:00', height: 0.8 },
    { time: '01:00', height: 1.4 },
    { time: '02:00', height: 1 },
    { time: '03:00', height: 0.6 }
  ])
  assert.deepEqual(tide.tide_extremes, [
    { type: 'high', time: '01:00', height: 1.4 },
    { type: 'low', time: '03:00', height: 0.6 }
  ])
  assert.equal(tide.source, 'open-meteo')
})

test('buildQWeatherNowUrl uses longitude,latitude location order', () => {
  const url = buildQWeatherNowUrl({
    host: 'https://api.qweather.test',
    lat: 29.9857,
    lng: 122.2072
  })

  assert.equal(url, 'https://api.qweather.test/v7/weather/now?location=122.21,29.99&lang=zh&unit=m')
})

test('buildOpenMeteoForecastUrl requests free current weather fields', () => {
  const url = buildOpenMeteoForecastUrl({
    lat: 29.9857,
    lng: 122.2072
  })

  assert.equal(
    url,
    'https://api.open-meteo.com/v1/forecast?latitude=29.9857&longitude=122.2072&current=temperature_2m%2Cweather_code%2Cwind_speed_10m%2Cwind_direction_10m%2Cwind_gusts_10m%2Csurface_pressure&timezone=auto&forecast_days=1'
  )
})

test('normalizeOpenMeteoForecastResponse converts free weather data to TideTai fields', () => {
  const weather = normalizeOpenMeteoForecastResponse({
    current: {
      time: '2026-05-01T06:00',
      temperature_2m: 19.4,
      weather_code: 3,
      wind_speed_10m: 23.2,
      wind_direction_10m: 45,
      wind_gusts_10m: 36.1,
      surface_pressure: 1018.4
    }
  })

  assert.deepEqual(weather, {
    description: '阴',
    temp_current: 19.4,
    wind: {
      direction: '东北',
      level: 4,
      speed_kmh: 23.2,
      gust_level: 5,
      vs_spot_orientation: ''
    },
    pressure: {
      current: 1018.4,
      trend_24h: null,
      direction: 'flat'
    },
    observed_at: '2026-05-01T06:00',
    source: 'open-meteo'
  })
})

test('fetchWeatherData uses free Open-Meteo weather when QWeather is not configured', async () => {
  const calls = []
  const weather = await require('../../cloud-functions/shared/weather-fetcher').fetchWeatherData({
    lat: 29.9857,
    lng: 122.2072,
    qweatherHost: '',
    qweatherJwt: '',
    async fetchJson(url) {
      calls.push(url)
      return {
        current: {
          time: '2026-05-01T06:00',
          temperature_2m: 18.8,
          weather_code: 1,
          wind_speed_10m: 12.4,
          wind_direction_10m: 180,
          wind_gusts_10m: 24,
          surface_pressure: 1012.2
        }
      }
    }
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].startsWith('https://api.open-meteo.com/v1/forecast?'), true)
  assert.equal(weather.description, '晴间多云')
  assert.equal(weather.wind.direction, '南')
  assert.equal(weather.source, 'open-meteo')
})

test('normalizeQWeatherNow converts current weather to TideTai fields', () => {
  const weather = normalizeQWeatherNow({
    updateTime: '2026-05-01T06:00+08:00',
    now: {
      obsTime: '2026-05-01T05:50+08:00',
      temp: '19',
      text: '多云',
      windDir: '东北风',
      windScale: '4',
      windSpeed: '23',
      pressure: '1018'
    }
  })

  assert.deepEqual(weather, {
    description: '多云',
    temp_current: 19,
    wind: {
      direction: '东北风',
      level: 4,
      speed_kmh: 23,
      gust_level: null,
      vs_spot_orientation: ''
    },
    pressure: {
      current: 1018,
      trend_24h: null,
      direction: 'flat'
    },
    observed_at: '2026-05-01T05:50+08:00',
    source: 'qweather'
  })
})

test('normalizeOpenMeteoMarineResponse extracts water temperature', () => {
  const marine = normalizeOpenMeteoMarineResponse({
    current: {
      time: '2026-05-01T06:00',
      sea_surface_temperature: 18.3
    }
  })

  assert.deepEqual(marine, {
    water_temp: 18.3,
    observed_at: '2026-05-01T06:00',
    source: 'open-meteo'
  })
})

test('calculateMoon returns a deterministic local moon phase label', () => {
  const moon = calculateMoon(new Date('2026-05-01T00:00:00Z'))

  assert.match(moon.phase_text, /^满月(前|后) \d+ 天$/)
  assert.equal(typeof moon.age_days, 'number')
  assert.equal(moon.source, 'local')
})
