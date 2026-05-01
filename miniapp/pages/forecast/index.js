const { createCloudApi } = require('../../utils/api')
const { getUserSettings } = require('../../utils/cache')

Page({
  data: {
    loading: true,
    errorMessage: '',
    days: [],
    fetchedAt: '',
    skeletonRows: [1, 2, 3, 4, 5, 6, 7]
  },

  onLoad() {
    this.loadForecast()
  },

  async loadForecast() {
    const settings = getUserSettings() || {}

    this.setData({
      loading: true,
      errorMessage: ''
    })

    try {
      const forecast = await createCloudApi().getForecastData({
        spot: settings.active_spot,
        days: 7
      })

      this.setData({
        loading: false,
        days: forecast.days || [],
        fetchedAt: forecast.fetched_at || ''
      })
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || String(error)
      })
    }
  },

  backHome() {
    wx.redirectTo({ url: '/pages/home/index' })
  }
})
