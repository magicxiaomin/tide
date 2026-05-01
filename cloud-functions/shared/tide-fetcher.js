const DEFAULT_WORLDTIDES_BASE_URL = 'https://www.worldtides.info/api/v3'
const DEFAULT_OPEN_METEO_MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine'
const { fetchJson: defaultFetchJson } = require('./http')

function roundNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null
  }

  const scale = 10 ** digits
  return Math.round(Number(value) * scale) / scale
}

function extractTime(value) {
  if (!value) {
    return ''
  }

  const match = String(value).match(/T(\d{2}:\d{2})/)
  return match ? match[1] : String(value).slice(11, 16)
}

function normalizeExtremeType(type) {
  return String(type).toLowerCase().startsWith('h') ? 'high' : 'low'
}

function buildWorldTidesUrl({ lat, lng, date, days = 1, key, baseUrl = DEFAULT_WORLDTIDES_BASE_URL }) {
  const params = [
    'heights',
    'extremes',
    `date=${encodeURIComponent(date)}`,
    `lat=${encodeURIComponent(lat)}`,
    `lon=${encodeURIComponent(lng)}`,
    `days=${encodeURIComponent(days)}`,
    `key=${encodeURIComponent(key)}`
  ]

  return `${baseUrl}?${params.join('&')}`
}

function buildOpenMeteoTideUrl({ lat, lng, days = 1, baseUrl = DEFAULT_OPEN_METEO_MARINE_URL }) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: 'sea_level_height_msl',
    timezone: 'auto',
    forecast_days: String(days)
  })

  return `${baseUrl}?${params.toString()}`
}

function calculateTideRange(values) {
  const heights = values.map((item) => item.height).filter((height) => typeof height === 'number')

  if (heights.length === 0) {
    return null
  }

  return roundNumber(Math.max(...heights) - Math.min(...heights), 1)
}

function deriveExtremes(curve) {
  const extremes = []

  for (let index = 1; index < curve.length - 1; index += 1) {
    const previous = curve[index - 1].height
    const current = curve[index].height
    const next = curve[index + 1].height

    if (current >= previous && current >= next) {
      extremes.push({ type: 'high', time: curve[index].time, height: current })
    }

    if (current <= previous && current <= next) {
      extremes.push({ type: 'low', time: curve[index].time, height: current })
    }
  }

  if (curve.length > 0 && !extremes.some((item) => item.type === 'high')) {
    const high = curve.reduce((best, item) => (item.height > best.height ? item : best), curve[0])
    extremes.push({ type: 'high', time: high.time, height: high.height })
  }

  if (curve.length > 0 && !extremes.some((item) => item.type === 'low')) {
    const low = curve.reduce((best, item) => (item.height < best.height ? item : best), curve[0])
    extremes.push({ type: 'low', time: low.time, height: low.height })
  }

  return extremes.sort((left, right) => left.time.localeCompare(right.time))
}

function normalizeWorldTidesResponse(payload) {
  const tideCurve = (payload.heights || []).map((item) => ({
    time: extractTime(item.date),
    height: roundNumber(item.height, 2)
  }))

  const tideExtremes = (payload.extremes || []).map((item) => ({
    type: normalizeExtremeType(item.type),
    time: extractTime(item.date),
    height: roundNumber(item.height, 2)
  }))

  return {
    tide_curve: tideCurve,
    tide_extremes: tideExtremes,
    tide_range: calculateTideRange(tideExtremes.length > 0 ? tideExtremes : tideCurve),
    source: 'worldtides'
  }
}

function normalizeOpenMeteoTideResponse(payload) {
  const times = payload.hourly && Array.isArray(payload.hourly.time) ? payload.hourly.time : []
  const heights = payload.hourly && Array.isArray(payload.hourly.sea_level_height_msl)
    ? payload.hourly.sea_level_height_msl
    : []

  const tideCurve = times.map((time, index) => ({
    time: extractTime(time),
    height: roundNumber(heights[index], 2)
  })).filter((item) => item.height !== null)

  return {
    tide_curve: tideCurve,
    tide_extremes: deriveExtremes(tideCurve),
    tide_range: calculateTideRange(tideCurve),
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

async function fetchTideData({
  fetchJson = defaultFetchJson,
  lat,
  lng,
  date,
  days = 1,
  worldTidesKey = process.env.WORLDTIDES_API_KEY
}) {
  if (worldTidesKey) {
    const url = buildWorldTidesUrl({ lat, lng, date, days, key: worldTidesKey })
    const payload = await requestJson(fetchJson, url)
    return normalizeWorldTidesResponse(payload)
  }

  const url = buildOpenMeteoTideUrl({ lat, lng, days })
  const payload = await requestJson(fetchJson, url)
  return normalizeOpenMeteoTideResponse(payload)
}

module.exports = {
  buildOpenMeteoTideUrl,
  buildWorldTidesUrl,
  fetchTideData,
  normalizeOpenMeteoTideResponse,
  normalizeWorldTidesResponse
}
