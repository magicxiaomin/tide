const { createCloudApi } = require('../../utils/api')
const { getUserSettings } = require('../../utils/cache')
const {
  buildCatchCardStoragePayload,
  storeLatestCatchCard
} = require('../../utils/catch-card')
const { showToast } = require('../../utils/ui')
const {
  DEFAULT_SPECIES,
  buildCatchPayload,
  createDefaultCatchForm,
  incrementSpecies,
  savePendingCatch
} = require('../../utils/catch-form')
const { addLocalPhotos, removeLocalPhoto } = require('../../utils/local-photos')

function formatLocalDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Page({
  data: {
    form: createDefaultCatchForm(),
    speciesOptions: DEFAULT_SPECIES,
    speciesRows: DEFAULT_SPECIES.map((name) => ({ name, count: 0 })),
    baitOptions: ['南极虾', '青虫', '虾仁', '路亚'],
    snapshotText: '正在读取自动快照',
    saving: false,
    statusMessage: ''
  },

  onLoad() {
    const settings = getUserSettings() || {}
    const form = createDefaultCatchForm({
      spotId: settings.active_spot_id || 'dev-zhoushan',
      startedAt: formatLocalDateTime()
    })

    this.setData({
      form,
      speciesRows: this.buildSpeciesRows(form.species)
    })
    this.loadSnapshot(settings.active_spot)
  },

  buildSpeciesRows(species) {
    return this.data.speciesOptions.map((name) => {
      const item = (species || []).find((row) => row.name === name)

      return {
        name,
        count: item ? item.count : 0
      }
    })
  },

  async loadSnapshot(spot) {
    try {
      const today = await createCloudApi().getTodayData({ spot })
      this.setData({
        snapshotText: `${today.tide_type} · ${today.wind.direction || '--'} ${today.wind.level || '--'} 级 · ${today.moon.phase_text}`
      })
    } catch (error) {
      this.setData({ snapshotText: '保存时将再次尝试捕获天气快照' })
    }
  },

  changeSpecies(event) {
    const { name, delta } = event.currentTarget.dataset

    const species = incrementSpecies(this.data.form.species, name, Number(delta))

    this.setData({
      'form.species': species,
      speciesRows: this.buildSpeciesRows(species)
    })
  },

  selectBait(event) {
    this.setData({ 'form.bait': event.currentTarget.dataset.bait })
  },

  updateNote(event) {
    this.setData({ 'form.note': event.detail.value })
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 9 - (this.data.form.photo_local_paths || []).length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPaths = (res.tempFiles || []).map((file) => file.tempFilePath)
        const paths = addLocalPhotos(this.data.form.photo_local_paths, newPaths)

        this.setData({ 'form.photo_local_paths': paths })
      },
      fail: () => {
        showToast('没有选择照片')
      }
    })
  },

  removePhoto(event) {
    const index = Number(event.currentTarget.dataset.index)

    this.setData({
      'form.photo_local_paths': removeLocalPhoto(this.data.form.photo_local_paths, index)
    })
  },

  async submit() {
    const settings = getUserSettings() || {}
    const payload = {
      ...buildCatchPayload(this.data.form),
      spot: settings.active_spot
    }

    this.setData({ saving: true, statusMessage: '' })

    try {
      const result = await createCloudApi().createCatch(payload)
      const card = buildCatchCardStoragePayload({
        result,
        payload,
        spot: settings.active_spot
      })

      storeLatestCatchCard(card)
      wx.navigateTo({
        url: '/pages/catch-card/index'
      })

      this.setData({
        saving: false,
        statusMessage: `已保存渔获记录 ${result.id}`
      })
    } catch (error) {
      savePendingCatch(payload)
      showToast('网络失败，已暂存在本地')
      this.setData({
        saving: false,
        statusMessage: '网络失败，已暂存在本地，将在后续同步'
      })
    }
  }
})
