const TODAY_CACHE_KEY = 'today_data_cache'

function getCacheAgeHours(fetchedAt, now = new Date()) {
  const fetchedTime = new Date(fetchedAt).getTime()

  if (Number.isNaN(fetchedTime)) {
    return 0
  }

  return Math.round((now.getTime() - fetchedTime) / 3600000)
}

function shouldUseCachedData(cached) {
  return Boolean(cached && cached.date && cached.fetched_at)
}

function normalizeCachedToday(cached, now = new Date()) {
  return {
    ...cached,
    from_cache: true,
    cache_age_hours: getCacheAgeHours(cached.fetched_at, now)
  }
}

function saveTodayCache(today) {
  if (typeof wx === 'undefined' || !today) {
    return
  }

  wx.setStorageSync(TODAY_CACHE_KEY, today)
}

function loadTodayCache() {
  if (typeof wx === 'undefined') {
    return null
  }

  return wx.getStorageSync(TODAY_CACHE_KEY) || null
}

module.exports = {
  TODAY_CACHE_KEY,
  getCacheAgeHours,
  loadTodayCache,
  normalizeCachedToday,
  saveTodayCache,
  shouldUseCachedData
}
