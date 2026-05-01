const { buildDataDetailRows, loadLatestDataDetail } = require('../../utils/data-detail')

Page({
  data: {
    hasData: false,
    rows: [],
    updatedAt: ''
  },

  onLoad() {
    const today = loadLatestDataDetail()

    if (!today) {
      this.setData({ hasData: false })
      return
    }

    this.setData({
      hasData: true,
      rows: buildDataDetailRows(today),
      updatedAt: today.fetched_at || ''
    })
  }
})
