const cloud = require('wx-server-sdk')
const { createApiError } = require('../shared/errors')
const { buildCatchListResponse } = require('./service')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event = {}) => {
  try {
    const wxContext = cloud.getWXContext()
    const page = Number(event.page || 1)
    const size = Number(event.size || 20)
    const db = cloud.database()
    const result = await db.collection('catch_logs')
      .where({ openid: wxContext.OPENID || 'dev-openid' })
      .orderBy('created_at', 'desc')
      .skip((page - 1) * size)
      .limit(size)
      .get()

    return buildCatchListResponse({
      records: result.data || [],
      page,
      size
    })
  } catch (error) {
    return createApiError(
      'CATCH_LIST_FAILED',
      error.message || '渔获列表读取失败',
      true
    )
  }
}
