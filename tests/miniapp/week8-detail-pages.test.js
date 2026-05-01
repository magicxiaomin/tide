const assert = require('node:assert/strict')
const test = require('node:test')

const appConfig = require('../../miniapp/app.json')
const {
  buildCatchDetailViewModel,
  buildCatchRecordCardPayload
} = require('../../miniapp/utils/catch-detail')
const { buildDataDetailRows } = require('../../miniapp/utils/data-detail')

test('Week 8 detail pages are registered in the miniapp', () => {
  assert.ok(appConfig.pages.includes('pages/catch-detail/index'))
  assert.ok(appConfig.pages.includes('pages/data-detail/index'))
})

test('buildCatchDetailViewModel exposes full catch data from a list item', () => {
  const detail = buildCatchDetailViewModel({
    id: 'catch-1',
    spot_name: '沈家门码头',
    started_at: '2026-05-01 06:20',
    species: [{ name: '真鲷', count: 2 }],
    bait: '南极虾',
    note: '流水偏急',
    weather_snapshot: {
      tide_type: '中潮',
      wind: { direction: '东北', level: '3' }
    }
  })

  assert.equal(detail.title, '沈家门码头')
  assert.equal(detail.speciesText, '真鲷 x 2')
  assert.ok(detail.rows.some((row) => row.label === '潮型' && row.value === '中潮'))
  assert.ok(detail.rows.some((row) => row.label === '备注' && row.value === '流水偏急'))
})

test('buildCatchRecordCardPayload converts a detail record back into catch-card storage data', () => {
  const card = buildCatchRecordCardPayload({
    id: 'catch-1',
    spot_name: '沈家门码头',
    started_at: '2026-05-01 06:20',
    species: [{ name: '黑鲷', count: 1 }],
    photo_local_paths: ['tmp/a.jpg'],
    weather_snapshot: { tide_type: '中潮' }
  })

  assert.equal(card.catch_id, 'catch-1')
  assert.equal(card.payload.spot_name, '沈家门码头')
  assert.deepEqual(card.photos, ['tmp/a.jpg'])
})

test('buildDataDetailRows keeps full home data factual and source-oriented', () => {
  const rows = buildDataDetailRows({
    tide_type: '中潮',
    wind: { direction: '东北', level: '3' },
    weather: { description: '多云', temp_current: 18, water_temp: 16 },
    pressure: { current: 1012, direction: 'rising' },
    moon: { phase_text: '盈凸月', moonrise: '18:20' },
    sources: { tide: 'Open-Meteo Marine', weather: 'Open-Meteo' }
  })

  assert.ok(rows.some((row) => row.label === '潮型' && row.value === '中潮'))
  assert.ok(rows.some((row) => row.label === '数据来源'))
  assert.equal(rows.some((row) => /推荐|评分/.test(row.value)), false)
})
