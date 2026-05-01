const cloud = require('wx-server-sdk')
const { createApiError } = require('../shared/errors')
const { buildForecastData } = require('./service')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event = {}) => {
  try {
    return await buildForecastData({
      spot: event.spot,
      days: event.days || 7
    })
  } catch (error) {
    return createApiError(
      'DATA_FORECAST_UNAVAILABLE',
      error.message || '七日预报暂时不可用,请稍后重试',
      true
    )
  }
}
