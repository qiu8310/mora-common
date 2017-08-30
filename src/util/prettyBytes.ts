const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

export default function prettyBypes(num, base = 1024) {
  if (!isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`)
  }

  const neg = num < 0
  if (neg) num = -num
  if (num < 1) return (neg ? '-' : '') + num + ' B'

  let exponent = 0
  let testNum = num
  let found = UNITS.some((unit, index) => {
    testNum /= index ? base : 1
    if (testNum < 1) {
      exponent = index - 1
      return true
    }
  })
  if (!found) exponent = UNITS.length - 1

  // const exponent = Math.min(Math.floor(Math.log10(num) / 3), UNITS.length - 1)
  const numStr = Number((num / Math.pow(base, exponent)).toPrecision(3))

  return (neg ? '-' : '') + numStr + ' ' + UNITS[exponent]
}
