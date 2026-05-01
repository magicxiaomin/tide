function formatDistanceKm(distanceKm) {
  const distance = Number(distanceKm)

  if (Number.isNaN(distance)) {
    return '--'
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`
  }

  return `${distance.toFixed(1)} km`
}

function setActiveSpot(spots, activeSpotId) {
  return (spots || []).map((spot) => ({
    ...spot,
    is_active: String(spot.id) === String(activeSpotId)
  }))
}

function summarizeSpot(spot) {
  return `${spot.name} · ${formatDistanceKm(spot.distance_km)} · ${spot.fishing_style || '海钓'}`
}

module.exports = {
  formatDistanceKm,
  setActiveSpot,
  summarizeSpot
}
