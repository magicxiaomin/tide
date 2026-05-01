const USER_SETTINGS_KEY = 'user_settings'

function getStorage(key, fallback = null) {
  try {
    const value = wx.getStorageSync(key)
    return value || fallback
  } catch (error) {
    return fallback
  }
}

function setStorage(key, value) {
  wx.setStorageSync(key, value)
  return value
}

function getUserSettings() {
  return getStorage(USER_SETTINGS_KEY, null)
}

function saveUserSettings(settings) {
  return setStorage(USER_SETTINGS_KEY, settings)
}

module.exports = {
  USER_SETTINGS_KEY,
  getUserSettings,
  saveUserSettings
}
