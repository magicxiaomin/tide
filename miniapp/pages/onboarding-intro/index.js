const { saveUserSettings } = require('../../utils/cache')

Page({
  next() {
    wx.navigateTo({ url: '/pages/onboarding-spot/index' })
  },

  skip() {
    saveUserSettings({
      onboarded: true,
      active_spot_id: 'dev-zhoushan',
      active_spot: {
        id: 'dev-zhoushan',
        name: '舟山默认钓点',
        latitude: 29.9857,
        longitude: 122.2072
      }
    })
    wx.redirectTo({ url: '/pages/home/index' })
  }
})
