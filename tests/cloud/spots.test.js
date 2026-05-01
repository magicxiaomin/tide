const assert = require('node:assert/strict')
const test = require('node:test')

const { listNearbySpots } = require('../../cloud-functions/shared/spots')

test('listNearbySpots returns nearby system spots sorted by distance', () => {
  const spots = listNearbySpots({
    lat: 29.9857,
    lng: 122.2072,
    radiusKm: 30
  })

  assert.ok(spots.length >= 5)
  assert.ok(spots.length <= 10)
  assert.equal(spots[0].distance_km <= spots[1].distance_km, true)
  assert.equal(Boolean(spots[0].name), true)
  assert.equal(Boolean(spots[0].fishing_style), true)
})
