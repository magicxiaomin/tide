const assert = require('node:assert/strict')
const test = require('node:test')

const {
  buildCatchPayload,
  createDefaultCatchForm,
  incrementSpecies
} = require('../../miniapp/utils/catch-form')

test('createDefaultCatchForm starts with one empty species row', () => {
  const form = createDefaultCatchForm({
    spotId: 'spot-1',
    startedAt: '2026-05-01 06:00'
  })

  assert.equal(form.spot_id, 'spot-1')
  assert.equal(form.started_at, '2026-05-01 06:00')
  assert.deepEqual(form.species, [{ name: '真鲷', count: 0 }])
})

test('incrementSpecies adjusts species count without going below zero', () => {
  const increased = incrementSpecies([{ name: '真鲷', count: 1 }], '真鲷', 1)
  const decreased = incrementSpecies(increased, '真鲷', -4)

  assert.equal(increased[0].count, 2)
  assert.equal(decreased[0].count, 0)
})

test('buildCatchPayload removes zero-count species and keeps notes', () => {
  const payload = buildCatchPayload({
    spot_id: 'spot-1',
    started_at: '2026-05-01 06:00',
    ended_at: '2026-05-01 12:00',
    species: [
      { name: '真鲷', count: 2 },
      { name: '鲈鱼', count: 0 }
    ],
    bait: '南极虾',
    note: '潮水转急'
  })

  assert.deepEqual(payload.species, [{ name: '真鲷', count: 2 }])
  assert.equal(payload.photo_count, 0)
  assert.equal(payload.note, '潮水转急')
})
