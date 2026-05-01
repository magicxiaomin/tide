const assert = require('node:assert/strict')
const test = require('node:test')

const { buildTidePolyline, calculateCurrentTimeX } = require('../../miniapp/utils/tide-view')

test('buildTidePolyline maps tide heights into svg coordinates', () => {
  const points = buildTidePolyline({
    curve: [
      { time: '00:00', height: 0 },
      { time: '12:00', height: 2 },
      { time: '23:00', height: 1 }
    ],
    width: 240,
    height: 80
  })

  assert.equal(points, '0,80 120,0 230,40')
})

test('calculateCurrentTimeX maps current hour into a 24 hour width', () => {
  assert.equal(calculateCurrentTimeX('06:00', 240), 60)
  assert.equal(calculateCurrentTimeX('18:30', 240), 185)
})
