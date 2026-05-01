const assert = require('node:assert/strict')
const test = require('node:test')

const {
  buildCatchCardDrawPlan,
  buildCatchCardStoragePayload,
  createAlbumAuthGuide
} = require('../../miniapp/utils/catch-card')

test('buildCatchCardDrawPlan creates a shareable canvas plan with photos, tide wave, data boxes, and brand', () => {
  const plan = buildCatchCardDrawPlan({
    catch_id: 'catch-1',
    photos: ['tmp/photo-a.jpg', 'tmp/photo-b.jpg'],
    payload: {
      spot_name: '沈家门码头',
      started_at: '2026-05-01 06:20',
      species: [{ name: '真鲷', count: 2 }],
      bait: '南极虾'
    },
    weather_snapshot: {
      tide_type: '中潮',
      tide_curve: [
        { hour: '00:00', height: 0.2 },
        { hour: '04:00', height: 1.6 },
        { hour: '08:00', height: 0.5 },
        { hour: '12:00', height: 1.9 },
        { hour: '16:00', height: 0.4 },
        { hour: '20:00', height: 1.4 }
      ],
      wind: { direction: '东北', level: '3' },
      weather: { water_temp: 16 },
      pressure: { current: 1012 },
      moon: { phase_text: '盈凸月' }
    }
  })

  assert.equal(plan.width, 750)
  assert.equal(plan.height, 1000)
  assert.deepEqual(plan.background.colors, ['#052B3B', '#0E6F8F', '#F2C57C'])
  assert.equal(plan.photos.length, 2)
  assert.notEqual(plan.photos[0].rotation, plan.photos[1].rotation)
  assert.ok(plan.wave.points.length >= 6)
  assert.equal(plan.speciesRows[0].text, '真鲷 x 2')
  assert.ok(plan.dataBoxes.some((box) => box.label === '用饵' && box.value === '南极虾'))
  assert.ok(plan.dataBoxes.some((box) => box.label === '水温' && box.value === '16°C'))
  assert.equal(plan.brand.primary, '鲷会')
})

test('buildCatchCardDrawPlan keeps blank trips and local-only photos shareable', () => {
  const plan = buildCatchCardDrawPlan({
    catch_id: 'catch-blank',
    photos: [],
    payload: {
      spot_name: '朱家尖礁石',
      started_at: '2026-05-02 15:10',
      species: [],
      bait: ''
    },
    weather_snapshot: {}
  })

  assert.equal(plan.photos.length, 0)
  assert.equal(plan.photoPlaceholder.text, '照片留在本机相册')
  assert.equal(plan.speciesRows[0].text, '空军 · 0 尾')
  assert.equal(plan.dataBoxes.find((box) => box.label === '用饵').value, '未记录')
})

test('buildCatchCardStoragePayload stores card data without uploading photo binaries or URLs', () => {
  const card = buildCatchCardStoragePayload({
    result: {
      id: 'catch-1',
      weather_snapshot: { tide_type: '中潮' }
    },
    payload: {
      spot_id: 'spot-1',
      photo_local_paths: ['tmp/local-a.jpg'],
      species: [{ name: '黑鲷', count: 1 }]
    },
    spot: { name: '沈家门码头' }
  })

  assert.equal(card.catch_id, 'catch-1')
  assert.deepEqual(card.photos, ['tmp/local-a.jpg'])
  assert.equal(card.payload.spot_name, '沈家门码头')
  assert.equal(Object.hasOwn(card, 'photo_blob'), false)
  assert.equal(Object.hasOwn(card, 'photo_url'), false)
})

test('createAlbumAuthGuide explains how to recover from album permission denial', () => {
  const guide = createAlbumAuthGuide({ errMsg: 'saveImageToPhotosAlbum:fail auth deny' })

  assert.equal(guide.needsSettings, true)
  assert.match(guide.message, /相册权限/)
})
