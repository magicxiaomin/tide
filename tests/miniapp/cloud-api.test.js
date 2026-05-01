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

test('getTodayData calls the Week 2 data-today cloud function', async () => {
  const calls = []
  const api = createCloudApi({
    callFunction(options) {
      calls.push(options)
      return Promise.resolve({
        result: {
          date: '2026-05-01',
          spot: { name: '舟山测试钓点' },
          tide_type: '潮差 4.6 m'
        }
      })
    }
  })

  const result = await api.getTodayData({
    spot: {
      id: 1,
      name: '舟山测试钓点',
      latitude: 29.9857,
      longitude: 122.2072
    },
    date: '2026-05-01'
  })

  assert.deepEqual(calls, [
    {
      name: 'data-today',
      data: {
        spot: {
          id: 1,
          name: '舟山测试钓点',
          latitude: 29.9857,
          longitude: 122.2072
        },
        date: '2026-05-01'
      }
    }
  ])
  assert.equal(result.tide_type, '潮差 4.6 m')
})

test('getTodayData surfaces backend error messages', async () => {
  const api = createCloudApi({
    callFunction() {
      return Promise.resolve({
        result: {
          error: {
            code: 'DATA_TODAY_UNAVAILABLE',
            message: '今日数据暂时不可用',
            retryable: true
          }
        }
      })
    }
  })

  await assert.rejects(
    () => api.getTodayData({}),
    /data-today cloud function failed: 今日数据暂时不可用/
  )
})

test('getNearbySpots calls the Week 3 spots-nearby cloud function', async () => {
  const calls = []
  const api = createCloudApi({
    callFunction(options) {
      calls.push(options)
      return Promise.resolve({
        result: {
          spots: [{ id: 'spot-1', name: '测试钓点' }]
        }
      })
    }
  })

  const result = await api.getNearbySpots({
    lat: 29.9857,
    lng: 122.2072,
    radiusKm: 20
  })

  assert.deepEqual(calls, [
    {
      name: 'spots-nearby',
      data: {
        lat: 29.9857,
        lng: 122.2072,
        radiusKm: 20
      }
    }
  ])
  assert.equal(result.spots[0].name, '测试钓点')
})

test('getForecastData calls the Week 4 data-forecast cloud function', async () => {
  const calls = []
  const api = createCloudApi({
    callFunction(options) {
      calls.push(options)
      return Promise.resolve({
        result: {
          days: [{ date: '2026-05-01' }]
        }
      })
    }
  })

  const result = await api.getForecastData({
    spot: { id: 'spot-1' },
    days: 7
  })

  assert.deepEqual(calls, [
    {
      name: 'data-forecast',
      data: {
        spot: { id: 'spot-1' },
        days: 7
      }
    }
  ])
  assert.equal(result.days.length, 1)
})

test('createCatch calls the Week 5 catches-create cloud function', async () => {
  const calls = []
  const api = createCloudApi({
    callFunction(options) {
      calls.push(options)
      return Promise.resolve({
        result: {
          id: 'catch-1'
        }
      })
    }
  })

  const result = await api.createCatch({
    spot_id: 'spot-1',
    species: [{ name: '真鲷', count: 2 }]
  })

  assert.deepEqual(calls, [
    {
      name: 'catches-create',
      data: {
        spot_id: 'spot-1',
        species: [{ name: '真鲷', count: 2 }]
      }
    }
  ])
  assert.equal(result.id, 'catch-1')
})
