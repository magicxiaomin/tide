const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const DOCS_DIR = path.join(__dirname, '../../docs')

function readDoc(name) {
  return fs.readFileSync(path.join(DOCS_DIR, name), 'utf8')
}

test('Week 9 release readiness documents exist', () => {
  for (const file of [
    'WEEK9_RELEASE_READINESS.md',
    'BETA_TEST_PLAN.md',
    'MINI_PROGRAM_SUBMISSION.md',
    'PRIVACY_POLICY.md',
    'LAUNCH_CHECKLIST.md'
  ]) {
    assert.equal(fs.existsSync(path.join(DOCS_DIR, file)), true)
  }
})

test('beta test plan covers real sea trips and angler testers', () => {
  const beta = readDoc('BETA_TEST_PLAN.md')

  assert.match(beta, /2 次真实出海/)
  assert.match(beta, /2-3 位钓友/)
  assert.match(beta, /打开 -> 看潮汐 -> 出海 -> 回来记录 -> 分享/)
})

test('submission copy includes intro, keywords, and no judgment promise', () => {
  const submission = readDoc('MINI_PROGRAM_SUBMISSION.md')

  assert.match(submission, /小程序简介/)
  assert.match(submission, /关键词/)
  assert.match(submission, /不替你判断/)
})

test('privacy policy states photos stay local and are not uploaded', () => {
  const policy = readDoc('PRIVACY_POLICY.md')

  assert.match(policy, /照片只保存在用户手机本地/)
  assert.match(policy, /不会上传到服务器/)
})
