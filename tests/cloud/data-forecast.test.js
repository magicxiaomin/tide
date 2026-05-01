const assert = require('node:assert/strict')
const test = require('node:test')

const { buildForecastData, pickMiniTideCurve } = require('../../cloud-functions/data-forecast/service')

test('pickMiniTideCurve samples a compact curve for seven-day rows', () => {
  const curve = Array.from({ length: 24 }, (_, hour) => ({
    time: `${String(hour).padStart(2, '0')}:00`,
    height: hour
  }))

  assert.deepEqual(pickMiniTideCurve(curve, 6), [
    { time: '00:00', height: 0 },
    { time: '04:00', height: 4 },
    { time: '08:00', height: 8 },
    { time: '12:00', height: 12 },
    { time: '16:00', height: 16 },
    { time: '20:00', height: 20 }
  ])
})

test('buildForecastData returns seven daily forecast rows', async () => {
  const forecast = await buildForecastData({
    spot: { id: 'spot-1', name: '测试钓点', latitude: 29.9, longitude: 122.2 },
    startDate: '2026-05-01',
    days: 7,
    now: new Date('2026-05-01T00:00:00Z'),
    providers: {
      async buildToday({ date }) {
        return {
          date,
          tide_type: '潮差 1.8 m',
          tide_curve: [
            { time: '00:00', height: 0.8 },
            { time: '06:00', height: 1.4 },
            { time: '12:00', height: 0.6 },
            { time: '18:00', height: 1.2 }
          ],
          wind: { direction: '东北', level: 4 },
          weather: { description: '晴', temp_current: 20 },
          fetched_at: '2026-05-01T00:00:00.000Z'
        }
      }
    }
  })

  assert.equal(forecast.days.length, 7)
  assert.equal(forecast.days[0].date, '2026-05-01')
  assert.equal(forecast.days[1].date, '2026-05-02')
  assert.equal(forecast.days[0].weather_emoji, '☀️')
  assert.deepEqual(forecast.days[0].wind, { direction: '东北', level: 4 })
  assert.equal(forecast.fetched_at, '2026-05-01T00:00:00.000Z')
})
