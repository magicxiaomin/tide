const assert = require('node:assert/strict')
const test = require('node:test')

const { COLLECTIONS } = require('../../cloud-functions/setup-db/schema')

test('Week 1 database collections match the product data model', () => {
  assert.deepEqual(
    COLLECTIONS.map((collection) => collection.name),
    [
      'users',
      'fishing_spots',
      'user_spots',
      'catch_logs',
      'tide_cache',
      'weather_cache'
    ]
  )
})

test('catch_logs stores only structured photo references, not uploaded photo binaries', () => {
  const catchLogs = COLLECTIONS.find((collection) => collection.name === 'catch_logs')

  assert.ok(catchLogs)
  assert.ok(catchLogs.fields.includes('photo_local_paths_json'))
  assert.equal(catchLogs.fields.includes('photo_blob'), false)
  assert.equal(catchLogs.fields.includes('photo_url'), false)
})
