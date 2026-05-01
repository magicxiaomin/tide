const assert = require('node:assert/strict')
const test = require('node:test')

const { buildCatchListResponse, summarizeSpecies } = require('../../cloud-functions/catches-list/service')

test('summarizeSpecies formats catch species counts', () => {
  assert.equal(
    summarizeSpecies(JSON.stringify([{ name: '真鲷', count: 2 }, { name: '黑鲷', count: 1 }])),
    '真鲷 ×2 · 黑鲷 ×1'
  )
  assert.equal(summarizeSpecies(JSON.stringify([])), '空军 · 0 条')
})

test('buildCatchListResponse returns catches and top stats', () => {
  const response = buildCatchListResponse({
    records: [
      {
        _id: 'catch-1',
        spot_id: 'spot-1',
        spot_name: '测试钓点',
        started_at: '2026-05-01 06:00',
        species_json: JSON.stringify([{ name: '真鲷', count: 2 }]),
        bait: '南极虾',
        weather_snapshot_json: JSON.stringify({ tide_type: '潮差 1.8 m', wind: { direction: '东北', level: 4 } }),
        photo_local_paths_json: JSON.stringify(['tmp://a.jpg'])
      },
      {
        _id: 'catch-2',
        spot_name: '测试钓点',
        started_at: '2026-05-02 06:00',
        species_json: JSON.stringify([]),
        bait: '',
        weather_snapshot_json: JSON.stringify({ tide_type: '潮差 1.2 m' }),
        photo_local_paths_json: JSON.stringify([])
      }
    ],
    page: 1,
    size: 20
  })

  assert.equal(response.total, 2)
  assert.equal(response.stats.total_trips, 2)
  assert.equal(response.stats.species_count, 1)
  assert.equal(response.stats.total_fish, 2)
  assert.equal(response.catches[0].species_summary, '真鲷 ×2')
  assert.equal(response.catches[0].photo_local_paths[0], 'tmp://a.jpg')
  assert.equal(response.catches[1].species_summary, '空军 · 0 条')
})
