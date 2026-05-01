const { createCloudApi } = require('../../utils/api')

Page({
  data: {
    loading: true,
    errorMessage: '',
    catches: [],
    stats: {
      total_trips: 0,
      species_count: 0,
      total_fish: 0
    }
  },

  onShow() {
    this.loadCatches()
  },

  async loadCatches() {
    this.setData({
      loading: true,
      errorMessage: ''
    })

    try {
      const result = await createCloudApi().getCatches({ page: 1, size: 20 })

      this.setData({
        loading: false,
        catches: result.catches || [],
        stats: result.stats || this.data.stats
      })
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || String(error)
      })
    }
  }
})
