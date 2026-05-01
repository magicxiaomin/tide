const assert = require('node:assert/strict')
const test = require('node:test')

const {
  getCacheAgeHours,
  normalizeCachedToday,
  shouldUseCachedData
} = require('../../miniapp/utils/data-cache')

test('getCacheAgeHours returns rounded elapsed hours', () => {
  assert.equal(
    getCacheAgeHours('2026-05-01T00:00:00.000Z', new Date('2026-05-01T06:20:00.000Z')),
    6
  )
})

test('shouldUseCachedData accepts cached today payloads', () => {
  assert.equal(shouldUseCachedData({ date: '2026-05-01', fetched_at: '2026-05-01T00:00:00.000Z' }), true)
  assert.equal(shouldUseCachedData(null), false)
})

test('normalizeCachedToday marks cached data for warning banners', () => {
  const cached = normalizeCachedToday(
    { date: '2026-05-01', fetched_at: '2026-05-01T00:00:00.000Z' },
    new Date('2026-05-01T04:00:00.000Z')
  )

  assert.equal(cached.from_cache, true)
  assert.equal(cached.cache_age_hours, 4)
})
