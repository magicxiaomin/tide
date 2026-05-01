function createApiError(code, message, retryable = true) {
  return {
    error: {
      code,
      message,
      retryable
    }
  }
}

module.exports = {
  createApiError
}
