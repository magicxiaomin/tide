const { createCloudApi } = require('./api')

async function getOpenid(api = createCloudApi()) {
  const result = await api.hello()

  if (!result.openid) {
    throw new Error('hello cloud function did not return openid')
  }

  return result
}

module.exports = {
  getOpenid
}
