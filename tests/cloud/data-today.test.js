const assert = require('node:assert/strict')
const test = require('node:test')

const { buildTodayData } = require('../../cloud-functions/data-today/service')

function createMemoryCache(initial = {}) {
  const store = new Map(Object.entries(initial))

  return {
    async get(key) {
      return store.get(key) || null
    },
    async set(key, value) {
      store.set(key, value)
      return value
    }
  }
}

test('buildTodayData combines tide, weather, marine, and moon data', async () => {
  const data = await buildTodayData({
    spot: {
      id: 1,
      name: '舟山测试钓点',
      latitude: 29.9857,
      longitude: 122.2072,
      coast_orientation: 'NE'
    },
    date: '2026-05-01',
    now: new Date('2026-05-01T06:30:00Z'),
    cache: createMemoryCache(),
    providers: {
      async fetchTide() {
        return {
          tide_curve: [{ time: '00:00', height: 1.2 }],
          tide_extremes: [{ type: 'high', time: '10:38', height: 4.8 }],
          tide_range: 4.6,
          source: 'worldtides'
        }
      },
      async fetchWeather() {
        return {
          description: '多云',
          temp_current: 19,
          wind: {
            direction: '东北风',
            level: 4,
            speed_kmh: 23,
            gust_level: null,
            vs_spot_orientation: ''
          },
          pressure: {
            current: 1018,
            trend_24h: null,
            direction: 'flat'
          },
          observed_at: '2026-05-01T05:50+08:00',
          source: 'qweather'
        }
      },
      async fetchMarine() {
        return {
          water_temp: 18.3,
          observed_at: '2026-05-01T06:00',
          source: 'open-meteo'
        }
      },
      calculateMoon() {
        return {
          phase_text: '满月后 0 天',
          moonrise: '',
          age_days: 15,
          source: 'local'
        }
      }
    }
  })

  assert.equal(data.date, '2026-05-01')
  assert.equal(data.spot.name, '舟山测试钓点')
  assert.equal(data.tide_type, '潮差 4.6 m')
  assert.deepEqual(data.tide_curve, [{ time: '00:00', height: 1.2 }])
  assert.equal(data.wind.direction, '东北风')
  assert.equal(data.weather.water_temp, 18.3)
  assert.equal(data.pressure.current, 1018)
  assert.equal(data.moon.phase_text, '满月后 0 天')
  assert.deepEqual(data.sources, {
    tide: 'worldtides',
    weather: 'qweather',
    marine: 'open-meteo',
    moon: 'local'
  })
})

test('buildTodayData returns fresh cached data before provider calls', async () => {
  let providerCalls = 0
  const cached = {
    date: '2026-05-01',
    fetched_at: '2026-05-01T04:00:00.000Z',
    from_cache: false
  }

  const data = await buildTodayData({
    spot: { id: 1, name: 'cached', latitude: 1, longitude: 2 },
    date: '2026-05-01',
    now: new Date('2026-05-01T06:30:00Z'),
    cache: createMemoryCache({
      'today:1:2026-05-01': cached
    }),
    providers: {
      async fetchTide() {
        providerCalls += 1
      },
      async fetchWeather() {
        providerCalls += 1
      },
      async fetchMarine() {
        providerCalls += 1
      },
      calculateMoon() {
        providerCalls += 1
      }
    }
  })

  assert.equal(providerCalls, 0)
  assert.equal(data.from_cache, true)
})
