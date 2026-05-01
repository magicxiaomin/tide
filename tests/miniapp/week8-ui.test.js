const assert = require('node:assert/strict')
const test = require('node:test')

const {
  toReadableError,
  withLoading
} = require('../../miniapp/utils/ui')

test('toReadableError prefers backend messages and falls back to friendly copy', () => {
  assert.equal(toReadableError({ message: 'provider timeout' }), 'provider timeout')
  assert.equal(toReadableError(null, '读取失败'), '读取失败')
})

test('withLoading toggles loading state around successful async work', async () => {
  const calls = []
  const result = await withLoading(
    (state) => calls.push(state),
    () => Promise.resolve('ok')
  )

  assert.equal(result, 'ok')
  assert.deepEqual(calls, [true, false])
})

test('withLoading clears loading state when async work throws', async () => {
  const calls = []

  await assert.rejects(
    withLoading(
      (state) => calls.push(state),
      () => Promise.reject(new Error('boom'))
    ),
    /boom/
  )

  assert.deepEqual(calls, [true, false])
})
