const assert = require('node:assert/strict')
const test = require('node:test')

const {
  formatDistanceKm,
  setActiveSpot,
  summarizeSpot
} = require('../../miniapp/utils/spots')

test('formatDistanceKm keeps nearby spot distances easy to scan', () => {
  assert.equal(formatDistanceKm(0.42), '420 m')
  assert.equal(formatDistanceKm(3.24), '3.2 km')
})

test('setActiveSpot marks exactly one spot active', () => {
  const spots = setActiveSpot([
    { id: 'a', name: 'A', is_active: true },
    { id: 'b', name: 'B', is_active: false }
  ], 'b')

  assert.deepEqual(spots.map((spot) => ({ id: spot.id, is_active: spot.is_active })), [
    { id: 'a', is_active: false },
    { id: 'b', is_active: true }
  ])
})

test('summarizeSpot includes name, distance, and fishing style', () => {
  assert.equal(
    summarizeSpot({
      name: '舟山测试礁',
      distance_km: 2.36,
      fishing_style: '矶钓,防波堤'
    }),
    '舟山测试礁 · 2.4 km · 矶钓,防波堤'
  )
})
