function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

function summarizeSpecies(speciesJson) {
  const species = parseJson(speciesJson, [])
  const stocked = species.filter((item) => Number(item.count) > 0)

  if (stocked.length === 0) {
    return '空军 · 0 条'
  }

  return stocked.map((item) => `${item.name} ×${item.count}`).join(' · ')
}

function buildWeatherSummary(snapshot, bait) {
  const parts = []

  if (snapshot.tide_type) parts.push(snapshot.tide_type)
  if (snapshot.wind) parts.push(`${snapshot.wind.direction || '--'} ${snapshot.wind.level || '--'} 级`)
  if (bait) parts.push(bait)

  return parts.join(' · ')
}

function buildStats(records) {
  const speciesNames = new Set()
  let totalFish = 0

  for (const record of records) {
    const species = parseJson(record.species_json, [])

    for (const item of species) {
      if (Number(item.count) > 0) {
        speciesNames.add(item.name)
        totalFish += Number(item.count)
      }
    }
  }

  return {
    total_trips: records.length,
    species_count: speciesNames.size,
    total_fish: totalFish
  }
}

function buildCatchListResponse({ records, page = 1, size = 20 }) {
  const catches = (records || []).map((record) => {
    const snapshot = parseJson(record.weather_snapshot_json, {})
    const photoLocalPaths = parseJson(record.photo_local_paths_json, [])

    return {
      id: record._id || record.id,
      spot_id: record.spot_id,
      spot_name: record.spot_name || record.spot_id || '未命名钓点',
      started_at: record.started_at || '',
      species_summary: summarizeSpecies(record.species_json),
      weather_summary: buildWeatherSummary(snapshot, record.bait),
      photo_local_paths: photoLocalPaths,
      has_photo: photoLocalPaths.length > 0,
      is_blank_trip: summarizeSpecies(record.species_json).startsWith('空军')
    }
  })

  return {
    catches,
    stats: buildStats(records || []),
    total: (records || []).length,
    page,
    size
  }
}

module.exports = {
  buildCatchListResponse,
  summarizeSpecies
}
