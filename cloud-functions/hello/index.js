const cloud = require('wx-server-sdk')
const { buildHelloResponse } = require('./response')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async () => {
  const wxContext = cloud.getWXContext()

  return buildHelloResponse({
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  })
}
