const SYSTEM_SPOTS = [
  { id: 'zhoushan-001', name: '朱家尖东沙', latitude: 29.9168, longitude: 122.3975, fishing_style: '矶钓,防波堤', coast_orientation: 'E' },
  { id: 'zhoushan-002', name: '沈家门渔港', latitude: 29.9576, longitude: 122.3034, fishing_style: '岸钓,船钓', coast_orientation: 'SE' },
  { id: 'zhoushan-003', name: '普陀山码头', latitude: 30.0061, longitude: 122.3907, fishing_style: '码头,矶钓', coast_orientation: 'S' },
  { id: 'zhoushan-004', name: '定海西码头', latitude: 30.0212, longitude: 122.1066, fishing_style: '防波堤,路亚', coast_orientation: 'W' },
  { id: 'zhoushan-005', name: '岱山长涂', latitude: 30.2483, longitude: 122.2875, fishing_style: '船钓,矶钓', coast_orientation: 'N' },
  { id: 'zhoushan-006', name: '六横台门', latitude: 29.7432, longitude: 122.1447, fishing_style: '矶钓,岸钓', coast_orientation: 'SE' },
  { id: 'zhoushan-007', name: '嵊泗菜园', latitude: 30.7262, longitude: 122.4518, fishing_style: '船钓,码头', coast_orientation: 'E' }
]

function toRadians(value) {
  return Number(value) * Math.PI / 180
}

function distanceKm(from, to) {
  const earthRadiusKm = 6371
  const dLat = toRadians(to.latitude - from.lat)
  const dLng = toRadians(to.longitude - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.latitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(earthRadiusKm * c * 10) / 10
}

function listNearbySpots({ lat, lng, radiusKm = 50 } = {}) {
  const origin = {
    lat: Number(lat),
    lng: Number(lng)
  }

  if (Number.isNaN(origin.lat) || Number.isNaN(origin.lng)) {
    origin.lat = 29.9857
    origin.lng = 122.2072
  }

  return SYSTEM_SPOTS
    .map((spot) => ({
      ...spot,
      distance_km: distanceKm(origin, spot)
    }))
    .filter((spot) => spot.distance_km <= Number(radiusKm || 50))
    .sort((left, right) => left.distance_km - right.distance_km)
    .slice(0, 10)
}

module.exports = {
  SYSTEM_SPOTS,
  listNearbySpots
}
