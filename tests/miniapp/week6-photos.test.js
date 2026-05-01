const assert = require('node:assert/strict')
const test = require('node:test')

const {
  addLocalPhotos,
  removeLocalPhoto
} = require('../../miniapp/utils/local-photos')
const { buildCatchPayload } = require('../../miniapp/utils/catch-form')

test('addLocalPhotos caps local photos at nine paths', () => {
  const paths = addLocalPhotos(['a'], ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'])

  assert.equal(paths.length, 9)
  assert.deepEqual(paths.slice(0, 3), ['a', 'b', 'c'])
})

test('removeLocalPhoto removes one path by index', () => {
  assert.deepEqual(removeLocalPhoto(['a', 'b', 'c'], 1), ['a', 'c'])
})

test('buildCatchPayload includes local photo paths but no upload payload', () => {
  const payload = buildCatchPayload({
    spot_id: 'spot-1',
    species: [{ name: '真鲷', count: 1 }],
    photo_local_paths: ['tmp://a.jpg', 'tmp://b.jpg']
  })

  assert.equal(payload.photo_count, 2)
  assert.deepEqual(payload.photo_local_paths, ['tmp://a.jpg', 'tmp://b.jpg'])
  assert.equal(Object.hasOwn(payload, 'photo_blob'), false)
})
