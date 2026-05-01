const http = require('node:http')
const https = require('node:https')

function getTransport(url) {
  return String(url).startsWith('https:') ? https : http
}

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const transport = getTransport(url)
    const request = transport.get(url, {
      headers: options.headers || {}
    }, (response) => {
      let body = ''

      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        body += chunk
      })
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`))
          return
        }

        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`))
        }
      })
    })

    request.on('error', reject)
    request.setTimeout(10000, () => {
      request.destroy(new Error('Request timed out after 10000ms'))
    })
  })
}

module.exports = {
  fetchJson
}
