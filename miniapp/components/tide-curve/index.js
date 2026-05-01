const { buildTidePolyline, calculateCurrentTimeX } = require('../../utils/tide-view')

Component({
  properties: {
    curve: {
      type: Array,
      value: []
    },
    extremes: {
      type: Array,
      value: []
    }
  },

  data: {
    svgSrc: '',
    highLowText: ''
  },

  observers: {
    'curve, extremes': function updateCurve(curve, extremes) {
      const width = 320
      const height = 112
      const points = buildTidePolyline({ curve, width, height })
      const now = new Date()
      const markerX = calculateCurrentTimeX(`${now.getHours()}:${now.getMinutes()}`, width)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" rx="10" fill="#ecf7f8"/><polyline points="${points}" fill="none" stroke="#0f6f7f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="${markerX}" x2="${markerX}" y1="8" y2="${height - 8}" stroke="#d94b3d" stroke-width="2" stroke-dasharray="6 6"/></svg>`
      const highLowText = (extremes || []).slice(0, 4).map((item) => `${item.type === 'high' ? '高潮' : '低潮'} ${item.time} ${item.height}m`).join(' · ')

      this.setData({
        svgSrc: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        highLowText
      })
    }
  }
})
