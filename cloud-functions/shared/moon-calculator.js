const SYNODIC_MONTH_DAYS = 29.530588853
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14)

function positiveModulo(value, modulo) {
  return ((value % modulo) + modulo) % modulo
}

function calculateMoon(date = new Date()) {
  const dateValue = date instanceof Date ? date : new Date(date)
  const daysSinceKnownNewMoon = (dateValue.getTime() - KNOWN_NEW_MOON_UTC) / 86400000
  const ageDays = positiveModulo(daysSinceKnownNewMoon, SYNODIC_MONTH_DAYS)
  const fullMoonAge = SYNODIC_MONTH_DAYS / 2
  const daysFromFull = Math.round(ageDays - fullMoonAge)
  const phaseText = daysFromFull <= 0
    ? `满月前 ${Math.abs(daysFromFull)} 天`
    : `满月后 ${daysFromFull} 天`

  return {
    phase_text: phaseText,
    moonrise: '',
    age_days: Math.round(ageDays * 10) / 10,
    source: 'local'
  }
}

module.exports = {
  calculateMoon
}
