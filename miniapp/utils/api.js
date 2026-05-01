const { CLOUD_FUNCTIONS } = require('../config/env')

function getDefaultCloudClient() {
  if (typeof wx !== 'undefined' && wx.cloud) {
    return wx.cloud
  }

  throw new Error('wx.cloud is not available')
}

function normalizeCloudError(error) {
  return error && (error.message || error.errMsg) ? error.message || error.errMsg : String(error)
}

function createCloudApi(cloudClient = getDefaultCloudClient()) {
  return {
    async hello() {
      try {
        const response = await cloudClient.callFunction({
          name: CLOUD_FUNCTIONS.HELLO,
          data: {}
        })

        return response.result || response
      } catch (error) {
        throw new Error(`hello cloud function failed: ${normalizeCloudError(error)}`)
      }
    }
  }
}

module.exports = {
  createCloudApi
}
