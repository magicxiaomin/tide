const {
  buildCatchDetailViewModel,
  buildCatchRecordCardPayload,
  loadSelectedCatch
} = require('../../utils/catch-detail')
const { storeLatestCatchCard } = require('../../utils/catch-card')

Page({
  data: {
    hasRecord: false,
    detail: {
      title: '',
      speciesText: '',
      photos: [],
      rows: []
    }
  },

  onLoad() {
    const record = loadSelectedCatch()

    if (!record) {
      this.setData({ hasRecord: false })
      return
    }

    this.record = record
    this.setData({
      hasRecord: true,
      detail: buildCatchDetailViewModel(record)
    })
  },

  openCatchCard() {
    if (!this.record) {
      return
    }

    storeLatestCatchCard(buildCatchRecordCardPayload(this.record))
    wx.navigateTo({ url: '/pages/catch-card/index' })
  }
})
