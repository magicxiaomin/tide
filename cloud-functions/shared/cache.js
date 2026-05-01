const SIX_HOURS_MS = 6 * 60 * 60 * 1000

function buildTodayCacheKey(spotId, date) {
  return `today:${spotId || 'default'}:${date}`
}

function isFreshCacheEntry(entry, now = new Date(), maxAgeMs = SIX_HOURS_MS) {
  if (!entry || !entry.fetched_at) {
    return false
  }

  const fetchedAt = new Date(entry.fetched_at).getTime()

  if (Number.isNaN(fetchedAt)) {
    return false
  }

  return now.getTime() - fetchedAt <= maxAgeMs
}

function createCloudCollectionCache(db, collectionName = 'weather_cache') {
  const collection = db.collection(collectionName)

  return {
    async get(key) {
      const result = await collection.where({ cache_key: key }).limit(1).get()
      return result.data && result.data.length > 0 ? result.data[0].value : null
    },

    async set(key, value) {
      const payload = {
        cache_key: key,
        value,
        fetched_at: value.fetched_at
      }
      const existing = await collection.where({ cache_key: key }).limit(1).get()

      if (existing.data && existing.data.length > 0) {
        await collection.doc(existing.data[0]._id).update({ data: payload })
        return value
      }

      await collection.add({ data: payload })
      return value
    }
  }
}

module.exports = {
  SIX_HOURS_MS,
  buildTodayCacheKey,
  createCloudCollectionCache,
  isFreshCacheEntry
}
