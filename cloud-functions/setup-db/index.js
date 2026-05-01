const cloud = require('wx-server-sdk')
const { COLLECTIONS } = require('./schema')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

function isAlreadyExistsError(error) {
  const message = error && (error.message || error.errMsg) ? error.message || error.errMsg : String(error)

  return message.includes('already exists') || message.includes('collection exists') || message.includes('-502005')
}

async function ensureCollection(db, collection) {
  try {
    await db.createCollection(collection.name)

    return {
      name: collection.name,
      created: true
    }
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      return {
        name: collection.name,
        created: false,
        reason: 'already_exists'
      }
    }

    throw error
  }
}

exports.main = async () => {
  const db = cloud.database()
  const collections = []

  for (const collection of COLLECTIONS) {
    collections.push(await ensureCollection(db, collection))
  }

  return {
    ok: true,
    collections
  }
}
