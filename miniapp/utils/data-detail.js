const DATA_DETAIL_STORAGE_KEY = 'latest_data_detail'

function stringifySource(sources = {}) {
  const entries = Object.keys(sources)
    .filter((key) => sources[key])
    .map((key) => `${key}: ${sources[key]}`)

  return entries.length > 0 ? entries.join(' · ') : '未记录'
}

function buildDataDetailRows(today = {}) {
  const wind = today.wind || {}
  const weather = today.weather || {}
  const pressure = today.pressure || {}
  const moon = today.moon || {}

  return [
    { label: '潮型', value: today.tide_type || '未记录' },
    { label: '风', value: `${wind.direction || '--'} ${wind.level || '--'}级` },
    { label: '阵风', value: wind.gust_level ? `${wind.gust_level}级` : '未记录' },
    { label: '天气', value: weather.description || '未记录' },
    { label: '气温', value: weather.temp_current === undefined ? '未记录' : `${weather.temp_current}°C` },
    { label: '水温', value: weather.water_temp === undefined ? '未记录' : `${weather.water_temp}°C` },
    { label: '气压', value: pressure.current === undefined ? '未记录' : `${pressure.current} hPa` },
    { label: '气压趋势', value: pressure.direction || '未记录' },
    { label: '月相', value: moon.phase_text || '未记录' },
    { label: '月出', value: moon.moonrise || '未记录' },
    { label: '数据来源', value: stringifySource(today.sources || {}) }
  ]
}

function storeLatestDataDetail(today) {
  if (typeof wx !== 'undefined') {
    wx.setStorageSync(DATA_DETAIL_STORAGE_KEY, today)
  }

  return today
}

function loadLatestDataDetail() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx.getStorageSync(DATA_DETAIL_STORAGE_KEY) || null
}

module.exports = {
  DATA_DETAIL_STORAGE_KEY,
  buildDataDetailRows,
  loadLatestDataDetail,
  storeLatestDataDetail
}
