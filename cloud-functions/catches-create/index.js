const cloud = require('wx-server-sdk')
const { buildTodayData } = require('../data-today/service')
const { createApiError } = require('../shared/errors')
const { createCatchRecord } = require('./service')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event = {}) => {
  try {
    const wxContext = cloud.getWXContext()
    const db = cloud.database()
    const result = await createCatchRecord({
      openid: wxContext.OPENID || 'dev-openid',
      input: event,
      db,
      getWeatherSnapshot: async (input) => buildTodayData({
        spot: input.spot,
        date: String(input.started_at || '').slice(0, 10) || undefined,
        cache: null
      })
    })

    return result
  } catch (error) {
    return createApiError(
      'CATCH_CREATE_FAILED',
      error.message || '渔获记录保存失败',
      true
    )
  }
}
