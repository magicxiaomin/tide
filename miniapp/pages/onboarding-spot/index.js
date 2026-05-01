const { createCloudApi } = require('../../utils/api')
const { saveUserSettings } = require('../../utils/cache')
const { formatDistanceKm, setActiveSpot } = require('../../utils/spots')

const DEFAULT_LOCATION = {
  latitude: 29.9857,
  longitude: 122.2072
}

Page({
  data: {
    loading: true,
    spots: [],
    selectedSpotId: '',
    errorMessage: ''
  },

  onLoad() {
    this.loadSpots()
  },

  async loadSpots() {
    try {
      const location = await this.getLocationOrDefault()
      const result = await createCloudApi().getNearbySpots({
        lat: location.latitude,
        lng: location.longitude,
        radiusKm: 50
      })
      const spots = (result.spots || []).map((spot, index) => ({
        ...spot,
        distance_text: formatDistanceKm(spot.distance_km),
        is_active: index === 0
      }))

      this.setData({
        loading: false,
        spots,
        selectedSpotId: spots[0] ? spots[0].id : '',
        errorMessage: ''
      })
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || String(error)
      })
    }
  },

  getLocationOrDefault() {
    return new Promise((resolve) => {
      wx.getLocation({
        type: 'gcj02',
        success: resolve,
        fail: () => resolve(DEFAULT_LOCATION)
      })
    })
  },

  selectSpot(event) {
    const id = event.currentTarget.dataset.id

    this.setData({
      selectedSpotId: id,
      spots: setActiveSpot(this.data.spots, id)
    })
  },

  complete() {
    const activeSpot = this.data.spots.find((spot) => String(spot.id) === String(this.data.selectedSpotId))

    saveUserSettings({
      onboarded: true,
      active_spot_id: activeSpot ? activeSpot.id : 'dev-zhoushan',
      active_spot: activeSpot || {
        id: 'dev-zhoushan',
        name: '舟山默认钓点',
        latitude: 29.9857,
        longitude: 122.2072
      },
      spots: this.data.spots
    })

    wx.redirectTo({ url: '/pages/home/index' })
  }
})
