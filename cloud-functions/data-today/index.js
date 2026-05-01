const cloud = require('wx-server-sdk')
const { createCloudCollectionCache } = require('../shared/cache')
const { createApiError } = require('../shared/errors')
const { buildTodayData } = require('./service')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event = {}) => {
  try {
    const db = cloud.database()
    const data = await buildTodayData({
      spot: event.spot,
      date: event.date,
      cache: createCloudCollectionCache(db, 'weather_cache')
    })

    return data
  } catch (error) {
    return createApiError(
      'DATA_TODAY_UNAVAILABLE',
      error.message || '今日数据暂时不可用,请稍后重试',
      true
    )
  }
}
