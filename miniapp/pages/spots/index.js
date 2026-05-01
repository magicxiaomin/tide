const { createCloudApi } = require('../../utils/api')
const { getUserSettings, saveUserSettings } = require('../../utils/cache')
const { formatDistanceKm, setActiveSpot } = require('../../utils/spots')

Page({
  data: {
    loading: true,
    spots: [],
    activeSpotId: '',
    errorMessage: ''
  },

  onShow() {
    this.loadSpots()
  },

  async loadSpots() {
    const settings = getUserSettings() || {}

    if (settings.spots && settings.spots.length > 0) {
      this.setData({
        loading: false,
        spots: settings.spots,
        activeSpotId: settings.active_spot_id || ''
      })
      return
    }

    try {
      const result = await createCloudApi().getNearbySpots({
        lat: 29.9857,
        lng: 122.2072,
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
        activeSpotId: spots[0] ? spots[0].id : ''
      })
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error.message || String(error)
      })
    }
  },

  activateSpot(event) {
    const id = event.currentTarget.dataset.id
    const spots = setActiveSpot(this.data.spots, id)
    const activeSpot = spots.find((spot) => String(spot.id) === String(id))

    saveUserSettings({
      onboarded: true,
      active_spot_id: id,
      active_spot: activeSpot,
      spots
    })

    this.setData({
      spots,
      activeSpotId: id
    })
  },

  backHome() {
    wx.redirectTo({ url: '/pages/home/index' })
  }
})
