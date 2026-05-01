const {
  CARD_HEIGHT,
  CARD_PRIVACY_OPTIONS,
  CARD_WIDTH,
  DEFAULT_CARD_PRIVACY,
  buildCatchCardDrawPlan,
  buildCatchCardShareTitle,
  createAlbumAuthGuide,
  loadLatestCatchCard,
  storeLatestCatchCard,
  toggleCardPrivacy
} = require('../../utils/catch-card')

function drawText(ctx, text, x, y, size, color) {
  ctx.setFillStyle(color)
  ctx.setFontSize(size)
  ctx.fillText(String(text), x, y)
}

function drawBox(ctx, x, y, width, height, color) {
  ctx.setFillStyle(color)
  ctx.fillRect(x, y, width, height)
}

function drawWave(ctx, points) {
  if (!points || points.length === 0) {
    return
  }

  ctx.setStrokeStyle('#F2C57C')
  ctx.setLineWidth(6)
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  points.slice(1).forEach((point) => {
    ctx.lineTo(point.x, point.y)
  })
  ctx.stroke()
}

function drawCard(ctx, plan) {
  const gradient = ctx.createLinearGradient(0, 0, 0, plan.height)
  gradient.addColorStop(0, plan.background.colors[0])
  gradient.addColorStop(0.52, plan.background.colors[1])
  gradient.addColorStop(1, plan.background.colors[2])
  ctx.setFillStyle(gradient)
  ctx.fillRect(0, 0, plan.width, plan.height)

  drawText(ctx, plan.header.eyebrow, 58, 76, 24, 'rgba(255,255,255,0.76)')
  drawText(ctx, plan.header.spotName, 58, 126, 44, '#FFFFFF')
  drawText(ctx, plan.header.startedAt, 58, 164, 24, 'rgba(255,255,255,0.78)')

  if (plan.photos.length > 0) {
    plan.photos.forEach((photo) => {
      ctx.save()
      ctx.translate(photo.x + photo.width / 2, photo.y + photo.height / 2)
      ctx.rotate((photo.rotation * Math.PI) / 180)
      ctx.drawImage(photo.src, -photo.width / 2, -photo.height / 2, photo.width, photo.height)
      ctx.restore()
    })
  } else {
    drawBox(ctx, plan.photoPlaceholder.x, plan.photoPlaceholder.y, plan.photoPlaceholder.width, plan.photoPlaceholder.height, 'rgba(255,255,255,0.16)')
    drawText(ctx, plan.photoPlaceholder.text, 246, 254, 30, 'rgba(255,255,255,0.82)')
  }

  drawBox(ctx, 46, 390, 658, 188, 'rgba(255,255,255,0.15)')
  drawText(ctx, plan.wave.label, 72, 432, 28, '#FFFFFF')
  drawWave(ctx, plan.wave.points)

  drawBox(ctx, 46, 610, 658, 128, 'rgba(255,255,255,0.9)')
  drawText(ctx, '渔获', 72, 652, 26, '#60727B')
  plan.speciesRows.slice(0, 3).forEach((row, index) => {
    drawText(ctx, row.text, 72, 696 + index * 34, 32, '#102033')
  })

  plan.dataBoxes.forEach((box, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = 46 + col * 335
    const y = 762 + row * 66

    drawBox(ctx, x, y, 318, 52, 'rgba(255,255,255,0.82)')
    drawText(ctx, box.label, x + 20, y + 32, 22, '#60727B')
    drawText(ctx, box.value, x + 116, y + 32, 24, '#102033')
  })

  drawText(ctx, plan.brand.primary, 58, 952, 34, '#102033')
  drawText(ctx, plan.brand.secondary, 150, 950, 22, '#34535F')
}

Page({
  data: {
    canvasWidth: CARD_WIDTH,
    canvasHeight: CARD_HEIGHT,
    hasCard: false,
    privacyOptions: [],
    saving: false,
    statusMessage: '',
    needsSettings: false
  },

  onLoad() {
    const card = loadLatestCatchCard()

    if (!card) {
      this.setData({ hasCard: false })
      return
    }

    this.card = {
      ...card,
      privacy: {
        ...DEFAULT_CARD_PRIVACY,
        ...(card.privacy || {})
      }
    }
    this.refreshPlan()
    this.setData({ hasCard: true })

    const render = () => this.renderCard()
    if (wx.nextTick) {
      wx.nextTick(render)
    } else {
      setTimeout(render, 0)
    }
  },

  onShow() {
    if (wx.showShareMenu) {
      wx.showShareMenu({
        menus: ['shareAppMessage']
      })
    }
  },

  refreshPlan() {
    this.drawPlan = buildCatchCardDrawPlan(this.card)
    this.setData({
      privacyOptions: CARD_PRIVACY_OPTIONS.map((option) => ({
        ...option,
        checked: this.card.privacy[option.key] !== false
      }))
    })
  },

  renderCard() {
    if (!this.drawPlan) {
      return
    }

    const ctx = wx.createCanvasContext('catchCard', this)
    drawCard(ctx, this.drawPlan)
    ctx.draw()
  },

  saveToAlbum() {
    if (!this.drawPlan) {
      return
    }

    this.setData({
      saving: true,
      statusMessage: '正在生成渔获卡图片',
      needsSettings: false
    })

    wx.canvasToTempFilePath({
      canvasId: 'catchCard',
      width: this.drawPlan.width,
      height: this.drawPlan.height,
      destWidth: this.drawPlan.width,
      destHeight: this.drawPlan.height,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            this.setData({
              saving: false,
              statusMessage: '已保存到相册，可以从相册分享到朋友圈',
              needsSettings: false
            })
          },
          fail: (error) => {
            const guide = createAlbumAuthGuide(error)
            this.setData({
              saving: false,
              statusMessage: guide.message,
              needsSettings: guide.needsSettings
            })
          }
        })
      },
      fail: (error) => {
        const guide = createAlbumAuthGuide(error)
        this.setData({
          saving: false,
          statusMessage: guide.message,
          needsSettings: guide.needsSettings
        })
      }
    }, this)
  },

  openSettings() {
    wx.openSetting({
      complete: () => {
        this.setData({
          statusMessage: '设置完成后，再点一次保存到相册即可',
          needsSettings: false
        })
      }
    })
  },

  togglePrivacy(event) {
    const key = event.currentTarget.dataset.key

    this.card = {
      ...this.card,
      privacy: toggleCardPrivacy(this.card.privacy, key)
    }
    storeLatestCatchCard(this.card)
    this.refreshPlan()
    this.renderCard()
  },

  onShareAppMessage() {
    return {
      title: buildCatchCardShareTitle(this.card),
      path: '/pages/home/index'
    }
  },

  backToEdit() {
    wx.navigateBack({ delta: 1 })
  }
})
