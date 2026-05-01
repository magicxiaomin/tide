const assert = require('node:assert/strict')
const test = require('node:test')

const { buildHelloResponse } = require('../../cloud-functions/hello/response')

test('buildHelloResponse returns hello with the caller openid', () => {
  const response = buildHelloResponse({
    openid: 'openid-from-wechat',
    appid: 'touristappid'
  })

  assert.equal(response.message, 'hello')
  assert.equal(response.openid, 'openid-from-wechat')
  assert.equal(response.appid, 'touristappid')
  assert.equal(response.source, 'cloudbase')
  assert.match(response.fetched_at, /^\d{4}-\d{2}-\d{2}T/)
})

test('buildHelloResponse uses a development openid when CloudBase context is empty', () => {
  const response = buildHelloResponse({})

  assert.equal(response.message, 'hello')
  assert.equal(response.openid, 'dev-openid')
})
