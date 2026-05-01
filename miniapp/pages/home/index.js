const { createCloudApi } = require('../../utils/api')

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
    this.loadTodayData()
  },

  async loadTodayData() {
    this.setData({
      loading: true,
      errorMessage: ''
    })

    try {
      const today = await createCloudApi().getTodayData({
        spot: DEFAULT_SPOT
      })

      this.setData({
        loading: false,
        today
      })
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || String(error)
      })
    }
  },

  retry() {
    this.loadTodayData()
  }
})
