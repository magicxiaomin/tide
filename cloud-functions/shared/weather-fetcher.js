const DEFAULT_OPEN_METEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'
const DEFAULT_OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const { fetchJson: defaultFetchJson } = require('./http')

function roundNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null
  }

  const scale = 10 ** digits
  return Math.round(Number(value) * scale) / scale
}

function parseInteger(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return Number.parseInt(value, 10)
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function buildQWeatherNowUrl({ host, lat, lng }) {
  const location = `${Number(lng).toFixed(2)},${Number(lat).toFixed(2)}`

  return `${trimTrailingSlash(host)}/v7/weather/now?location=${location}&lang=zh&unit=m`
}

function buildOpenMeteoForecastUrl({ lat, lng, baseUrl = DEFAULT_OPEN_METEO_FORECAST_URL }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: [
      'temperature_2m',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'surface_pressure'
    ].join(','),
    timezone: 'auto',
    forecast_days: '1'
  })

  return `${baseUrl}?${params.toString()}`
}

function buildOpenMeteoMarineUrl({ lat, lng, baseUrl = DEFAULT_OPEN_METEO_MARINE_URL }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'sea_surface_temperature',
    hourly: 'sea_surface_temperature',
    timezone: 'auto',
    forecast_days: '1'
  })

  return `${baseUrl}?${params.toString()}`
}

function weatherCodeToText(code) {
  const numericCode = Number(code)

  if (numericCode === 0) return '晴'
  if ([1, 2].includes(numericCode)) return '晴间多云'
  if (numericCode === 3) return '阴'
  if ([45, 48].includes(numericCode)) return '雾'
  if ([51, 53, 55, 56, 57].includes(numericCode)) return '毛毛雨'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(numericCode)) return '雨'
  if ([71, 73, 75, 77, 85, 86].includes(numericCode)) return '雪'
  if ([95, 96, 99].includes(numericCode)) return '雷阵雨'

  return '天气数据'
}

function windDegreeToDirection(degrees) {
  if (degrees === null || degrees === undefined || Number.isNaN(Number(degrees))) {
    return ''
  }

  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  const index = Math.round(Number(degrees) / 45) % directions.length
  return directions[index]
}

function kmhToBeaufort(speedKmh) {
  const speed = Number(speedKmh)

  if (Number.isNaN(speed)) return null
  if (speed < 1) return 0
  if (speed < 6) return 1
  if (speed < 12) return 2
  if (speed < 20) return 3
  if (speed < 29) return 4
  if (speed < 39) return 5
  if (speed < 50) return 6
  if (speed < 62) return 7
  if (speed < 75) return 8
  if (speed < 89) return 9
  if (speed < 103) return 10
  if (speed < 118) return 11
  return 12
}

function normalizeQWeatherNow(payload) {
  const now = payload.now || {}

  return {
    description: now.text || '',
    temp_current: parseInteger(now.temp),
    wind: {
      direction: now.windDir || '',
      level: parseInteger(now.windScale),
      speed_kmh: parseInteger(now.windSpeed),
      gust_level: null,
      vs_spot_orientation: ''
    },
    pressure: {
      current: parseInteger(now.pressure),
      trend_24h: null,
      direction: 'flat'
    },
    observed_at: now.obsTime || payload.updateTime || '',
    source: 'qweather'
  }
}

function normalizeOpenMeteoForecastResponse(payload) {
  const current = payload.current || {}

  return {
    description: weatherCodeToText(current.weather_code),
    temp_current: roundNumber(current.temperature_2m, 1),
    wind: {
      direction: windDegreeToDirection(current.wind_direction_10m),
      level: kmhToBeaufort(current.wind_speed_10m),
      speed_kmh: roundNumber(current.wind_speed_10m, 1),
      gust_level: kmhToBeaufort(current.wind_gusts_10m),
      vs_spot_orientation: ''
    },
    pressure: {
      current: roundNumber(current.surface_pressure, 1),
      trend_24h: null,
      direction: 'flat'
    },
    observed_at: current.time || '',
    source: 'open-meteo'
  }
}

function normalizeOpenMeteoMarineResponse(payload) {
  if (payload.current && payload.current.sea_surface_temperature !== undefined) {
    return {
      water_temp: roundNumber(payload.current.sea_surface_temperature, 1),
      observed_at: payload.current.time || '',
      source: 'open-meteo'
    }
  }

  const times = payload.hourly && Array.isArray(payload.hourly.time) ? payload.hourly.time : []
  const temperatures = payload.hourly && Array.isArray(payload.hourly.sea_surface_temperature)
    ? payload.hourly.sea_surface_temperature
    : []
  const firstIndex = temperatures.findIndex((value) => value !== null && value !== undefined)

  return {
    water_temp: firstIndex >= 0 ? roundNumber(temperatures[firstIndex], 1) : null,
    observed_at: firstIndex >= 0 ? times[firstIndex] : '',
    source: 'open-meteo'
  }
}

async function requestJson(fetchJson, url, options) {
  const response = await fetchJson(url, options)

  if (response && typeof response.json === 'function') {
    return response.json()
  }

  return response
}

async function fetchWeatherData({
  fetchJson = defaultFetchJson,
  lat,
  lng,
  qweatherHost = process.env.QWEATHER_API_HOST,
  qweatherJwt = process.env.QWEATHER_JWT
}) {
  if (!qweatherHost || !qweatherJwt) {
    const url = buildOpenMeteoForecastUrl({ lat, lng })
    const payload = await requestJson(fetchJson, url)
    return normalizeOpenMeteoForecastResponse(payload)
  }

  const url = buildQWeatherNowUrl({ host: qweatherHost, lat, lng })
  const payload = await requestJson(fetchJson, url, {
    headers: {
      Authorization: `Bearer ${qweatherJwt}`
    }
  })

  return normalizeQWeatherNow(payload)
}

async function fetchMarineData({ fetchJson = defaultFetchJson, lat, lng }) {
  const url = buildOpenMeteoMarineUrl({ lat, lng })
  const payload = await requestJson(fetchJson, url)

  return normalizeOpenMeteoMarineResponse(payload)
}

module.exports = {
  buildOpenMeteoForecastUrl,
  buildOpenMeteoMarineUrl,
  buildQWeatherNowUrl,
  fetchMarineData,
  fetchWeatherData,
  normalizeOpenMeteoForecastResponse,
  normalizeOpenMeteoMarineResponse,
  normalizeQWeatherNow
}
