const assert = require('node:assert/strict')
const test = require('node:test')

const { buildCatchListResponse } = require('../../cloud-functions/catches-list/service')

test('buildCatchListResponse includes structured fields needed by the catch detail page', () => {
  const response = buildCatchListResponse({
    records: [
      {
        _id: 'catch-detail-1',
        spot_id: 'spot-1',
        spot_name: 'test pier',
        started_at: '2026-05-01 06:00',
        species_json: JSON.stringify([{ name: 'snapper', count: 2 }]),
        bait: 'shrimp',
        note: 'fast current',
        weather_snapshot_json: JSON.stringify({
          tide_type: 'mid tide',
          wind: { direction: 'NE', level: 3 }
        }),
        photo_local_paths_json: JSON.stringify(['tmp://a.jpg']),
        photo_count: 1
      }
    ],
    page: 1,
    size: 20
  })

  assert.deepEqual(response.catches[0].species, [{ name: 'snapper', count: 2 }])
  assert.equal(response.catches[0].bait, 'shrimp')
  assert.equal(response.catches[0].note, 'fast current')
  assert.equal(response.catches[0].weather_snapshot.tide_type, 'mid tide')
  assert.equal(response.catches[0].photo_count, 1)
})
