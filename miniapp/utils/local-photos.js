const MAX_LOCAL_PHOTOS = 9

function addLocalPhotos(currentPaths, newPaths) {
  return [
    ...(currentPaths || []),
    ...(newPaths || [])
  ].slice(0, MAX_LOCAL_PHOTOS)
}

function removeLocalPhoto(paths, index) {
  return (paths || []).filter((_, currentIndex) => currentIndex !== index)
}

module.exports = {
  MAX_LOCAL_PHOTOS,
  addLocalPhotos,
  removeLocalPhoto
}
