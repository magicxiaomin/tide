function buildCatchRecord({ openid, input, weatherSnapshot, now = new Date() }) {
  return {
    openid,
    spot_id: input.spot_id || '',
    started_at: input.started_at || '',
    ended_at: input.ended_at || '',
    species_json: JSON.stringify(input.species || []),
    bait: input.bait || '',
    note: input.note || '',
    weather_snapshot_json: JSON.stringify(weatherSnapshot || {}),
    photo_local_paths_json: JSON.stringify([]),
    photo_count: Number(input.photo_count || 0),
    created_at: now.toISOString()
  }
}

async function createCatchRecord({
  openid,
  input,
  db,
  getWeatherSnapshot,
  now = new Date()
}) {
  const weatherSnapshot = await getWeatherSnapshot(input)
  const record = buildCatchRecord({
    openid,
    input,
    weatherSnapshot,
    now
  })
  const result = await db.collection('catch_logs').add({
    data: record
  })

  return {
    id: result._id,
    weather_snapshot: weatherSnapshot
  }
}

module.exports = {
  buildCatchRecord,
  createCatchRecord
}
