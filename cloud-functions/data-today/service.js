const { buildTodayCacheKey, isFreshCacheEntry } = require('../shared/cache')
const { fetchTideData } = require('../shared/tide-fetcher')
const { fetchMarineData, fetchWeatherData } = require('../shared/weather-fetcher')
const { calculateMoon } = require('../shared/moon-calculator')

const DEFAULT_SPOT = {
  id: 'dev-zhoushan',
  name: '舟山默认钓点',
  latitude: 29.9857,
  longitude: 122.2072,
  coast_orientation: ''
}

function normalizeDate(date, now = new Date()) {
  if (date) {
    return String(date).slice(0, 10)
  }

  return now.toISOString().slice(0, 10)
}

function normalizeSpot(spot = {}) {
  const merged = {
    ...DEFAULT_SPOT,
    ...spot
  }

  return {
    id: merged.id || DEFAULT_SPOT.id,
    name: merged.name || DEFAULT_SPOT.name,
    latitude: Number(merged.latitude),
    longitude: Number(merged.longitude),
    coast_orientation: merged.coast_orientation || ''
  }
}

function formatTideType(tideRange) {
  if (typeof tideRange !== 'number') {
    return '潮差待更新'
  }

  return `潮差 ${tideRange.toFixed(1)} m`
}

function buildCommonSpecies() {
  return ['真鲷', '黑鲷', '鲈鱼', '石斑']
}

async function buildTodayData({
  spot,
  date,
  now = new Date(),
  cache,
  providers = {}
}) {
  const targetDate = normalizeDate(date, now)
  const targetSpot = normalizeSpot(spot)
  const cacheKey = buildTodayCacheKey(targetSpot.id, targetDate)

  if (cache) {
    const cached = await cache.get(cacheKey)

    if (isFreshCacheEntry(cached, now)) {
      return {
        ...cached,
        from_cache: true
      }
    }
  }

  const providerSet = {
    fetchTide: providers.fetchTide || fetchTideData,
    fetchWeather: providers.fetchWeather || fetchWeatherData,
    fetchMarine: providers.fetchMarine || fetchMarineData,
    calculateMoon: providers.calculateMoon || calculateMoon
  }
  const providerInput = {
    lat: targetSpot.latitude,
    lng: targetSpot.longitude,
    date: targetDate
  }
  const [tide, weather, marine] = await Promise.all([
    providerSet.fetchTide(providerInput),
    providerSet.fetchWeather(providerInput),
    providerSet.fetchMarine(providerInput)
  ])
  const moon = providerSet.calculateMoon(new Date(`${targetDate}T12:00:00Z`))
  const fetchedAt = now.toISOString()
  const response = {
    date: targetDate,
    spot: targetSpot,
    tide_type: formatTideType(tide.tide_range),
    tide_curve: tide.tide_curve,
    tide_extremes: tide.tide_extremes,
    tide_range: tide.tide_range,
    wind: weather.wind,
    weather: {
      description: weather.description,
      temp_current: weather.temp_current,
      temp_min: null,
      temp_max: null,
      water_temp: marine.water_temp
    },
    pressure: weather.pressure,
    moon: {
      phase_text: moon.phase_text,
      moonrise: moon.moonrise
    },
    sun: {
      sunrise: '',
      sunset: ''
    },
    common_species: buildCommonSpecies(),
    sources: {
      tide: tide.source,
      weather: weather.source,
      marine: marine.source,
      moon: moon.source
    },
    fetched_at: fetchedAt,
    from_cache: false
  }

  if (cache) {
    await cache.set(cacheKey, response)
  }

  return response
}

module.exports = {
  DEFAULT_SPOT,
  buildTodayData,
  normalizeSpot
}
