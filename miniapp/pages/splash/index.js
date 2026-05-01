const { getOpenid } = require('../../utils/auth')
const { getUserSettings } = require('../../utils/cache')
const { decideSplashNextPage } = require('../../utils/navigation')

Page({
  data: {
    status: 'loading',
    message: '正在连接后端',
    openid: '',
    cloudMessage: '',
    fetchedAt: '',
    errorMessage: ''
  },

  onLoad() {
    this.loadOpenid()
  },

  async loadOpenid() {
    this.setData({
      status: 'loading',
      message: '正在连接后端',
      errorMessage: ''
    })

    try {
      const result = await getOpenid()

      this.setData({
        status: 'ready',
        message: '后端已连接',
        openid: result.openid,
        cloudMessage: result.message,
        fetchedAt: result.fetched_at || ''
      })
    } catch (error) {
      this.setData({
        status: 'error',
        message: '后端连接失败',
        errorMessage: error.message || String(error)
      })
    }
  },

  retry() {
    this.loadOpenid()
  },

  goHome() {
    wx.redirectTo({
      url: decideSplashNextPage(getUserSettings())
    })
  }
})
