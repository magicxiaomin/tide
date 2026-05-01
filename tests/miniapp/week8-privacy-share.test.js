const assert = require('node:assert/strict')
const test = require('node:test')

const {
  DEFAULT_CARD_PRIVACY,
  buildCatchCardDrawPlan,
  buildCatchCardShareTitle,
  toggleCardPrivacy
} = require('../../miniapp/utils/catch-card')

test('buildCatchCardDrawPlan hides data boxes disabled by privacy switches', () => {
  const plan = buildCatchCardDrawPlan({
    privacy: {
      ...DEFAULT_CARD_PRIVACY,
      bait: false,
      pressure: false
    },
    payload: {
      spot_name: '沈家门码头',
      species: [{ name: '真鲷', count: 1 }],
      bait: '南极虾'
    },
    weather_snapshot: {
      pressure: { current: 1012 },
      weather: { water_temp: 16 },
      moon: { phase_text: '满月' }
    }
  })

  assert.equal(plan.dataBoxes.some((box) => box.key === 'bait'), false)
  assert.equal(plan.dataBoxes.some((box) => box.key === 'pressure'), false)
  assert.equal(plan.dataBoxes.some((box) => box.key === 'water_temp'), true)
})

test('toggleCardPrivacy flips only the requested privacy field', () => {
  const next = toggleCardPrivacy(DEFAULT_CARD_PRIVACY, 'moon')

  assert.equal(next.moon, false)
  assert.equal(next.bait, true)
})

test('buildCatchCardShareTitle uses the catch spot without promising a judgment', () => {
  const title = buildCatchCardShareTitle({
    payload: {
      spot_name: '朱家尖礁石'
    }
  })

  assert.equal(title, '我的朱家尖礁石渔获卡')
  assert.equal(/推荐|评分|爆护/.test(title), false)
})
