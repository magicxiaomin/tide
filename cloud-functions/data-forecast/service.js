const { buildTodayData, DEFAULT_SPOT } = require('../data-today/service')

function addDays(date, offset) {
  const value = new Date(`${date}T00:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() + offset)
  return value.toISOString().slice(0, 10)
}

function pickMiniTideCurve(curve, limit = 8) {
  const data = curve || []

  if (data.length <= limit) {
    return data
  }

  const step = Math.max(1, Math.floor(data.length / limit))
  return data.filter((_, index) => index % step === 0).slice(0, limit)
}

function weatherEmoji(description) {
  if (!description) return '—'
  if (description.includes('晴')) return '☀️'
  if (description.includes('雨')) return '🌧️'
  if (description.includes('雪')) return '❄️'
  if (description.includes('阴')) return '☁️'
  if (description.includes('云')) return '⛅'
  return '🌤️'
}

async function buildForecastData({
  spot = DEFAULT_SPOT,
  startDate,
  days = 7,
  now = new Date(),
  cache,
  providers = {}
}) {
  const targetStartDate = startDate || now.toISOString().slice(0, 10)
  const buildToday = providers.buildToday || ((input) => buildTodayData({
    ...input,
    spot,
    cache: null
  }))
  const rows = []

  for (let index = 0; index < days; index += 1) {
    const date = addDays(targetStartDate, index)
    const today = await buildToday({
      spot,
      date,
      now,
      cache
    })

    rows.push({
      date,
      label: index === 0 ? '今天' : index === 1 ? '明天' : `第 ${index + 1} 天`,
      tide_type: today.tide_type,
      tide_curve_simple: pickMiniTideCurve(today.tide_curve, 8),
      wind: today.wind,
      weather_emoji: weatherEmoji(today.weather && today.weather.description),
      temp_max: today.weather ? today.weather.temp_current : null
    })
  }

  return {
    days: rows,
    fetched_at: now.toISOString()
  }
}

module.exports = {
  buildForecastData,
  pickMiniTideCurve,
  weatherEmoji
}
