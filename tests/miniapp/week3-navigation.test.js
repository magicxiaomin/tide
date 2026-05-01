const assert = require('node:assert/strict')
const test = require('node:test')

const { decideSplashNextPage } = require('../../miniapp/utils/navigation')

test('decideSplashNextPage sends first-time users to onboarding intro', () => {
  assert.equal(decideSplashNextPage(null), '/pages/onboarding-intro/index')
  assert.equal(decideSplashNextPage({}), '/pages/onboarding-intro/index')
})

test('decideSplashNextPage sends onboarded users to home', () => {
  assert.equal(
    decideSplashNextPage({
      onboarded: true,
      active_spot_id: 'spot-1'
    }),
    '/pages/home/index'
  )
})
