function toReadableError(error, fallback = '操作失败，请稍后重试') {
  if (!error) {
    return fallback
  }

  return error.message || error.errMsg || String(error) || fallback
}

async function withLoading(setLoading, task) {
  setLoading(true)

  try {
    return await task()
  } finally {
    setLoading(false)
  }
}

function showToast(message, icon = 'none') {
  const payload = {
    title: String(message || '操作失败'),
    icon
  }

  if (typeof wx !== 'undefined' && wx.showToast) {
    wx.showToast(payload)
  }

  return payload
}

module.exports = {
  showToast,
  toReadableError,
  withLoading
}
