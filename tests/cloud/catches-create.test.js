const assert = require('node:assert/strict')
const test = require('node:test')

const { buildCatchRecord, createCatchRecord } = require('../../cloud-functions/catches-create/service')

test('buildCatchRecord stores structured catch data without photo binaries', () => {
  const record = buildCatchRecord({
    openid: 'openid-1',
    input: {
      spot_id: 'spot-1',
      started_at: '2026-05-01 06:00',
      ended_at: '2026-05-01 12:00',
      species: [{ name: '真鲷', count: 2 }],
      bait: '南极虾',
      note: '风浪偏大',
      photo_count: 0
    },
    weatherSnapshot: { tide_type: '潮差 1.8 m' },
    now: new Date('2026-05-01T12:30:00Z')
  })

  assert.equal(record.openid, 'openid-1')
  assert.equal(record.spot_id, 'spot-1')
  assert.equal(record.species_json, JSON.stringify([{ name: '真鲷', count: 2 }]))
  assert.equal(record.weather_snapshot_json, JSON.stringify({ tide_type: '潮差 1.8 m' }))
  assert.equal(record.photo_count, 0)
  assert.equal(Object.hasOwn(record, 'photo_blob'), false)
  assert.equal(Object.hasOwn(record, 'photo_url'), false)
})

test('createCatchRecord saves a record and returns its weather snapshot', async () => {
  const writes = []
  const result = await createCatchRecord({
    openid: 'openid-1',
    input: {
      spot_id: 'spot-1',
      species: [{ name: '黑鲷', count: 1 }],
      bait: '青虫'
    },
    db: {
      collection() {
        return {
          async add(payload) {
            writes.push(payload.data)
            return { _id: 'catch-1' }
          }
        }
      }
    },
    getWeatherSnapshot: async () => ({ wind: { direction: '东北' } }),
    now: new Date('2026-05-01T12:30:00Z')
  })

  assert.equal(writes.length, 1)
  assert.equal(result.id, 'catch-1')
  assert.deepEqual(result.weather_snapshot, { wind: { direction: '东北' } })
})
