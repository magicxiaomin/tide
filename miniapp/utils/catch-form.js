const DEFAULT_SPECIES = ['真鲷', '黑鲷', '鲈鱼']
const PENDING_CATCHES_KEY = 'pending_catches'

function createDefaultCatchForm({ spotId, startedAt } = {}) {
  return {
    spot_id: spotId || '',
    started_at: startedAt || '',
    ended_at: '',
    species: [{ name: '真鲷', count: 0 }],
    bait: '',
    note: '',
    photo_local_paths: []
  }
}

function incrementSpecies(species, name, delta) {
  const rows = species && species.length > 0 ? species : [{ name, count: 0 }]
  const exists = rows.some((item) => item.name === name)
  const nextRows = exists ? rows : [...rows, { name, count: 0 }]

  return nextRows.map((item) => {
    if (item.name !== name) {
      return item
    }

    return {
      ...item,
      count: Math.max(0, Number(item.count || 0) + delta)
    }
  })
}

function buildCatchPayload(form) {
  return {
    spot_id: form.spot_id,
    started_at: form.started_at,
    ended_at: form.ended_at,
    species: (form.species || []).filter((item) => Number(item.count) > 0),
    bait: form.bait || '',
    note: form.note || '',
    photo_local_paths: form.photo_local_paths || [],
    photo_count: (form.photo_local_paths || []).length
  }
}

function savePendingCatch(payload) {
  if (typeof wx === 'undefined') {
    return []
  }

  const current = wx.getStorageSync(PENDING_CATCHES_KEY) || []
  const next = [
    ...current,
    {
      ...payload,
      pending_at: new Date().toISOString()
    }
  ]

  wx.setStorageSync(PENDING_CATCHES_KEY, next)
  return next
}

module.exports = {
  DEFAULT_SPECIES,
  PENDING_CATCHES_KEY,
  buildCatchPayload,
  createDefaultCatchForm,
  incrementSpecies,
  savePendingCatch
}
