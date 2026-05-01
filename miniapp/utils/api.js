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

async function callCloudFunction(cloudClient, functionName, data = {}) {
  const response = await cloudClient.callFunction({
    name: functionName,
    data
  })
  const result = response.result || response

  if (result && result.error) {
    throw new Error(result.error.message || result.error.code || 'cloud function returned an error')
  }

  return result
}

function createCloudApi(cloudClient = getDefaultCloudClient()) {
  return {
    async hello() {
      try {
        return await callCloudFunction(cloudClient, CLOUD_FUNCTIONS.HELLO)
      } catch (error) {
        throw new Error(`hello cloud function failed: ${normalizeCloudError(error)}`)
      }
    },

    async getTodayData({ spot, date } = {}) {
      try {
        return await callCloudFunction(cloudClient, CLOUD_FUNCTIONS.DATA_TODAY, {
          spot,
          date
        })
      } catch (error) {
        throw new Error(`data-today cloud function failed: ${normalizeCloudError(error)}`)
      }
    },

    async getNearbySpots({ lat, lng, radiusKm } = {}) {
      try {
        return await callCloudFunction(cloudClient, CLOUD_FUNCTIONS.SPOTS_NEARBY, {
          lat,
          lng,
          radiusKm
        })
      } catch (error) {
        throw new Error(`spots-nearby cloud function failed: ${normalizeCloudError(error)}`)
      }
    },

    async getForecastData({ spot, days } = {}) {
      try {
        return await callCloudFunction(cloudClient, CLOUD_FUNCTIONS.DATA_FORECAST, {
          spot,
          days
        })
      } catch (error) {
        throw new Error(`data-forecast cloud function failed: ${normalizeCloudError(error)}`)
      }
    }
  }
}

module.exports = {
  createCloudApi
}
