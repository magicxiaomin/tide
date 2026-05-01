const CARD_STORAGE_KEY = 'latest_catch_card'
const CARD_WIDTH = 750
const CARD_HEIGHT = 1000
const BACKGROUND_COLORS = ['#052B3B', '#0E6F8F', '#F2C57C']
const DEFAULT_CARD_PRIVACY = {
  bait: true,
  water_temp: true,
  pressure: true,
  moon: true,
  wind: true,
  tide: true
}
const CARD_PRIVACY_OPTIONS = [
  { key: 'bait', label: '用饵' },
  { key: 'water_temp', label: '水温' },
  { key: 'pressure', label: '气压' },
  { key: 'moon', label: '月相' },
  { key: 'wind', label: '风' },
  { key: 'tide', label: '潮型' }
]

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function formatTemperature(value) {
  if (value === undefined || value === null || value === '') {
    return '未记录'
  }

  return `${value}°C`
}

function formatPressure(value) {
  if (value === undefined || value === null || value === '') {
    return '未记录'
  }

  return `${value} hPa`
}

function formatWind(wind = {}) {
  const direction = wind.direction || '风向未记'
  const level = wind.level ? `${wind.level}级` : ''

  return `${direction}${level ? ` ${level}` : ''}`
}

function buildSpeciesRows(species = []) {
  const rows = species
    .filter((item) => Number(item.count || 0) > 0)
    .map((item) => ({
      text: `${item.name} x ${Number(item.count || 0)}`,
      count: Number(item.count || 0)
    }))

  if (rows.length === 0) {
    return [{ text: '空军 · 0 尾', count: 0 }]
  }

  return rows
}

function normalizeTideCurve(curve = []) {
  const usable = curve
    .map((point, index) => ({
      hour: point.hour || point.time || `${index}:00`,
      height: Number(point.height)
    }))
    .filter((point) => Number.isFinite(point.height))

  if (usable.length > 0) {
    return usable
  }

  return [
    { hour: '00:00', height: 0.4 },
    { hour: '04:00', height: 1.5 },
    { hour: '08:00', height: 0.6 },
    { hour: '12:00', height: 1.8 },
    { hour: '16:00', height: 0.5 },
    { hour: '20:00', height: 1.3 }
  ]
}

function buildWavePoints(curve = []) {
  const normalized = normalizeTideCurve(curve)
  const heights = normalized.map((point) => point.height)
  const min = Math.min(...heights)
  const max = Math.max(...heights)
  const range = max - min || 1
  const left = 82
  const top = 424
  const width = 586
  const height = 124

  return normalized.map((point, index) => ({
    x: Math.round(left + (width * index) / Math.max(normalized.length - 1, 1)),
    y: Math.round(top + height - ((point.height - min) / range) * height),
    hour: point.hour,
    height: point.height
  }))
}

function buildDataBoxes(payload = {}, weather = {}) {
  const weatherInfo = weather.weather || {}
  const pressure = weather.pressure || {}
  const moon = weather.moon || {}

  return [
    { key: 'bait', label: '用饵', value: payload.bait || '未记录' },
    { key: 'water_temp', label: '水温', value: formatTemperature(weatherInfo.water_temp) },
    { key: 'pressure', label: '气压', value: formatPressure(pressure.current) },
    { key: 'moon', label: '月相', value: moon.phase_text || '未记录' },
    { key: 'wind', label: '风', value: formatWind(weather.wind || {}) },
    { key: 'tide', label: '潮型', value: weather.tide_type || '未记录' }
  ]
}

function buildPhotoBlocks(photos = []) {
  const frames = [
    { x: 64, y: 120, width: 310, height: 250, rotation: -2.5 },
    { x: 330, y: 142, width: 300, height: 228, rotation: 2 },
    { x: 214, y: 88, width: 280, height: 210, rotation: -1.2 }
  ]

  return photos.slice(0, 3).map((src, index) => ({
    ...frames[index],
    src
  }))
}

function buildCatchCardDrawPlan(input = {}) {
  const payload = input.payload || {}
  const weather = input.weather_snapshot || input.weatherSnapshot || {}
  const privacy = {
    ...DEFAULT_CARD_PRIVACY,
    ...(input.privacy || {})
  }
  const photos = buildPhotoBlocks(input.photos || payload.photo_local_paths || [])
  const speciesRows = buildSpeciesRows(payload.species || [])

  return {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    background: {
      colors: BACKGROUND_COLORS
    },
    header: {
      eyebrow: '今日渔获',
      spotName: firstValue(payload.spot_name, input.spot && input.spot.name, payload.spot_id, '未命名钓点'),
      startedAt: payload.started_at || '未记录时间'
    },
    photos,
    photoPlaceholder: photos.length > 0
      ? null
      : {
          x: 64,
          y: 120,
          width: 622,
          height: 250,
          text: '照片留在本机相册'
        },
    wave: {
      label: weather.tide_type || '潮汐曲线',
      points: buildWavePoints(weather.tide_curve || [])
    },
    speciesRows,
    dataBoxes: buildDataBoxes(payload, weather).filter((box) => privacy[box.key] !== false),
    brand: {
      primary: '鲷会',
      secondary: 'TideTai · 判断是用户的，信息是产品的承诺'
    }
  }
}

function buildCatchCardStoragePayload({ result = {}, payload = {}, spot = {}, photos } = {}) {
  return {
    catch_id: result.id || result._id || '',
    payload: {
      ...payload,
      spot_name: firstValue(payload.spot_name, spot.name, payload.spot_id, '未命名钓点')
    },
    weather_snapshot: result.weather_snapshot || {},
    photos: photos || payload.photo_local_paths || [],
    privacy: { ...DEFAULT_CARD_PRIVACY },
    created_at: new Date().toISOString()
  }
}

function toggleCardPrivacy(privacy = DEFAULT_CARD_PRIVACY, key) {
  if (!Object.hasOwn(DEFAULT_CARD_PRIVACY, key)) {
    return {
      ...DEFAULT_CARD_PRIVACY,
      ...privacy
    }
  }

  const normalized = {
    ...DEFAULT_CARD_PRIVACY,
    ...privacy
  }

  return {
    ...normalized,
    [key]: !normalized[key]
  }
}

function buildCatchCardShareTitle(input = {}) {
  const payload = input.payload || {}
  const spotName = firstValue(payload.spot_name, input.spot && input.spot.name, payload.spot_id, '这次')

  return `我的${spotName}渔获卡`
}

function storeLatestCatchCard(card) {
  if (typeof wx !== 'undefined') {
    wx.setStorageSync(CARD_STORAGE_KEY, card)
  }

  return card
}

function loadLatestCatchCard() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx.getStorageSync(CARD_STORAGE_KEY) || null
}

function createAlbumAuthGuide(error = {}) {
  const errMsg = error.errMsg || String(error)
  const denied = /auth|authorize|deny|denied/i.test(errMsg)

  return {
    needsSettings: denied,
    message: denied
      ? '保存失败：需要开启相册权限。请在小程序设置里允许保存到相册后再试。'
      : '保存失败：请稍后重试，或先截图保存这张渔获卡。'
  }
}

module.exports = {
  BACKGROUND_COLORS,
  CARD_PRIVACY_OPTIONS,
  CARD_HEIGHT,
  CARD_STORAGE_KEY,
  CARD_WIDTH,
  DEFAULT_CARD_PRIVACY,
  buildCatchCardDrawPlan,
  buildCatchCardShareTitle,
  buildCatchCardStoragePayload,
  createAlbumAuthGuide,
  loadLatestCatchCard,
  storeLatestCatchCard,
  toggleCardPrivacy
}
