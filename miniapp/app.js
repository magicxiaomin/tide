const { CLOUD_ENV_ID } = require('./config/env')

App({
  onLaunch() {
    if (!wx.cloud) {
      console.warn('wx.cloud is unavailable. Check base library version in project.config.json.')
      return
    }

    const cloudOptions = {
      traceUser: true
    }

    if (CLOUD_ENV_ID) {
      cloudOptions.env = CLOUD_ENV_ID
    }

    wx.cloud.init(cloudOptions)
  },

  globalData: {
    brandName: '鲷会',
    productName: 'TideTai',
    cloudEnvId: CLOUD_ENV_ID
  }
})
