const { createCloudApi } = require('../../utils/api')
const { storeSelectedCatch } = require('../../utils/catch-detail')
const { toReadableError, withLoading } = require('../../utils/ui')

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
      errorMessage: ''
    })

    try {
      await withLoading(
        (loading) => this.setData({ loading }),
        async () => {
          const result = await createCloudApi().getCatches({ page: 1, size: 20 })

          this.setData({
            catches: result.catches || [],
            stats: result.stats || this.data.stats
          })
        }
      )
    } catch (error) {
      this.setData({
        errorMessage: toReadableError(error, '读取渔获记录失败')
      })
    }
  },

  goCatchDetail(event) {
    const index = Number(event.currentTarget.dataset.index)
    const record = this.data.catches[index]

    if (!record) {
      return
    }

    storeSelectedCatch(record)
    wx.navigateTo({ url: '/pages/catch-detail/index' })
  }
})
