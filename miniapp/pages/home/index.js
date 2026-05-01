const { createCloudApi } = require('../../utils/api')
const { getUserSettings } = require('../../utils/cache')
const {
  loadTodayCache,
  normalizeCachedToday,
  saveTodayCache,
  shouldUseCachedData
} = require('../../utils/data-cache')

const DEFAULT_SPOT = {
  id: 'dev-zhoushan',
  name: '舟山默认钓点',
  latitude: 29.9857,
  longitude: 122.2072
}

Page({
  data: {
    loading: true,
    errorMessage: '',
    cacheWarning: '',
    currentSpot: DEFAULT_SPOT,
    today: {
      spot: {},
      wind: {},
      weather: {},
      pressure: {},
      moon: {},
      sources: {}
    }
  },

  onLoad() {
    const settings = getUserSettings()
    const currentSpot = settings && settings.active_spot ? settings.active_spot : DEFAULT_SPOT

    this.setData({ currentSpot })
    this.loadTodayData()
  },

  async loadTodayData() {
    this.setData({
      loading: true,
      errorMessage: ''
    })

    try {
      const today = await createCloudApi().getTodayData({
        spot: this.data.currentSpot
      })

      this.setData({
        loading: false,
        cacheWarning: '',
        today
      })
      saveTodayCache(today)
    } catch (error) {
      const cached = loadTodayCache()

      if (shouldUseCachedData(cached)) {
        const today = normalizeCachedToday(cached)

        this.setData({
          loading: false,
          today,
          cacheWarning: `网络连接失败，显示的是 ${today.cache_age_hours} 小时前的缓存数据`,
          errorMessage: ''
        })
        return
      }

      this.setData({
        loading: false,
        errorMessage: error.message || String(error)
      })
    }
  },

  retry() {
    this.loadTodayData()
  },

  goForecast() {
    wx.navigateTo({ url: '/pages/forecast/index' })
  },

  goCatchLog() {
    wx.navigateTo({ url: '/pages/catch-log/index' })
  },

  goSpots() {
    wx.navigateTo({ url: '/pages/spots/index' })
  },

  goMyCatches() {
    wx.navigateTo({ url: '/pages/my-catches/index' })
  }
})
