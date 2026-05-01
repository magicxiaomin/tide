const { listNearbySpots } = require('../shared/spots')

exports.main = async (event = {}) => {
  return {
    spots: listNearbySpots({
      lat: event.lat,
      lng: event.lng,
      radiusKm: event.radiusKm || event.radius || 50
    })
  }
}
