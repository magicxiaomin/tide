const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const appConfig = require('../../miniapp/app.json')

test('Week 7 catch card preview page is registered in the miniapp', () => {
  assert.ok(appConfig.pages.includes('pages/catch-card/index'))
})

test('Week 7 catch card preview page files exist', () => {
  const pageDir = path.join(__dirname, '../../miniapp/pages/catch-card')

  for (const file of ['index.js', 'index.json', 'index.wxml', 'index.wxss']) {
    assert.equal(fs.existsSync(path.join(pageDir, file)), true)
  }
})
