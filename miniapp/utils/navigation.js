function decideSplashNextPage(userSettings) {
  if (userSettings && userSettings.onboarded && userSettings.active_spot_id) {
    return '/pages/home/index'
  }

  return '/pages/onboarding-intro/index'
}

module.exports = {
  decideSplashNextPage
}
