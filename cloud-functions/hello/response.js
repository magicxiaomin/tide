function buildHelloResponse(context = {}, clock = () => new Date()) {
  return {
    message: 'hello',
    openid: context.openid || context.OPENID || 'dev-openid',
    appid: context.appid || context.APPID || '',
    unionid: context.unionid || context.UNIONID || '',
    source: 'cloudbase',
    fetched_at: clock().toISOString()
  }
}

module.exports = {
  buildHelloResponse
}
