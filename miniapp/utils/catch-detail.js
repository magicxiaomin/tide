const { buildCatchCardStoragePayload } = require('./catch-card')

const CATCH_DETAIL_STORAGE_KEY = 'selected_catch_detail'

function formatSpecies(species = []) {
  const stocked = species.filter((item) => Number(item.count || 0) > 0)

  if (stocked.length === 0) {
    return '空军 · 0 尾'
  }

  return stocked.map((item) => `${item.name} x ${Number(item.count || 0)}`).join(' · ')
}

function formatWind(wind = {}) {
  if (!wind.direction && !wind.level) {
    return '未记录'
  }

  return `${wind.direction || '--'} ${wind.level || '--'}级`
}

function buildCatchDetailViewModel(record = {}) {
  const weather = record.weather_snapshot || {}
  const speciesText = formatSpecies(record.species || [])

  return {
    id: record.id,
    title: record.spot_name || record.spot_id || '未命名钓点',
    speciesText,
    photos: record.photo_local_paths || [],
    rows: [
      { label: '时间', value: record.started_at || '未记录' },
      { label: '鱼获', value: speciesText },
      { label: '用饵', value: record.bait || '未记录' },
      { label: '潮型', value: weather.tide_type || '未记录' },
      { label: '风', value: formatWind(weather.wind || {}) },
      { label: '气压', value: weather.pressure && weather.pressure.current ? `${weather.pressure.current} hPa` : '未记录' },
      { label: '月相', value: weather.moon && weather.moon.phase_text ? weather.moon.phase_text : '未记录' },
      { label: '备注', value: record.note || '未记录' }
    ]
  }
}

function buildCatchRecordCardPayload(record = {}) {
  return buildCatchCardStoragePayload({
    result: {
      id: record.id,
      weather_snapshot: record.weather_snapshot || {}
    },
    payload: {
      spot_id: record.spot_id,
      spot_name: record.spot_name,
      started_at: record.started_at,
      species: record.species || [],
      bait: record.bait || '',
      note: record.note || '',
      photo_local_paths: record.photo_local_paths || []
    },
    photos: record.photo_local_paths || []
  })
}

function storeSelectedCatch(record) {
  if (typeof wx !== 'undefined') {
    wx.setStorageSync(CATCH_DETAIL_STORAGE_KEY, record)
  }

  return record
}

function loadSelectedCatch() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx.getStorageSync(CATCH_DETAIL_STORAGE_KEY) || null
}

module.exports = {
  CATCH_DETAIL_STORAGE_KEY,
  buildCatchDetailViewModel,
  buildCatchRecordCardPayload,
  loadSelectedCatch,
  storeSelectedCatch
}
