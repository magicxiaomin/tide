function parseMinutes(time) {
  const [hour, minute] = String(time || '00:00').split(':').map((value) => Number.parseInt(value, 10))

  return (Number.isNaN(hour) ? 0 : hour) * 60 + (Number.isNaN(minute) ? 0 : minute)
}

function calculateCurrentTimeX(time, width) {
  return Math.round((parseMinutes(time) / (24 * 60)) * width)
}

function buildTidePolyline({ curve, width, height }) {
  const data = curve || []

  if (data.length === 0) {
    return ''
  }

  const heights = data.map((item) => Number(item.height))
  const minHeight = Math.min(...heights)
  const maxHeight = Math.max(...heights)
  const range = maxHeight - minHeight || 1

  return data.map((item, index) => {
    const x = data.length === 1 ? 0 : calculateCurrentTimeX(item.time, width)
    const normalized = (Number(item.height) - minHeight) / range
    const y = Math.round(height - normalized * height)

    return `${x},${y}`
  }).join(' ')
}

module.exports = {
  buildTidePolyline,
  calculateCurrentTimeX
}
