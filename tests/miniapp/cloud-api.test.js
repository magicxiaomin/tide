const assert = require('node:assert/strict')
const test = require('node:test')

const { createCloudApi } = require('../../miniapp/utils/api')

test('hello calls the Week 1 hello cloud function', async () => {
  const calls = []
  const api = createCloudApi({
    callFunction(options) {
      calls.push(options)
      return Promise.resolve({
        result: {
          message: 'hello',
          openid: 'openid-from-cloud'
        }
      })
    }
  })

  const result = await api.hello()

  assert.deepEqual(calls, [{ name: 'hello', data: {} }])
  assert.equal(result.message, 'hello')
  assert.equal(result.openid, 'openid-from-cloud')
})

test('hello normalizes cloud function failures into readable errors', async () => {
  const api = createCloudApi({
    callFunction() {
      return Promise.reject(new Error('cloud unavailable'))
    }
  })

  await assert.rejects(
    () => api.hello(),
    /hello cloud function failed: cloud unavailable/
  )
})
