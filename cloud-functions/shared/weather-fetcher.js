const DEFAULT_OPEN_METEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'
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
    return {
      description: '天气源未配置',
      temp_current: null,
      wind: {
        direction: '',
        level: null,
        speed_kmh: null,
        gust_level: null,
        vs_spot_orientation: ''
      },
      pressure: {
        current: null,
        trend_24h: null,
        direction: 'flat'
      },
      observed_at: '',
      source: 'not-configured'
    }
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
  buildOpenMeteoMarineUrl,
  buildQWeatherNowUrl,
  fetchMarineData,
  fetchWeatherData,
  normalizeOpenMeteoMarineResponse,
  normalizeQWeatherNow
}
