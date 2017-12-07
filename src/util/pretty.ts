import {formatElapsedSeconds} from './formatElapsedSeconds'
import {formatDate} from './formatDate'
const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

export function prettyBytes(num: number, base = 1024): string {
  if (!isFinite(num)) throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`)

  const neg = num < 0
  if (neg) num = -num
  if (num < 1) return (neg ? '-' : '') + num + ' B'

  let exponent = 0
  let testNum = num
  let found = BYTE_UNITS.some((unit, index) => {
    testNum /= index ? base : 1
    if (testNum < 1) {
      exponent = index - 1
      return true
    }
    return false
  })
  if (!found) exponent = BYTE_UNITS.length - 1

  // const exponent = Math.min(Math.floor(Math.log10(num) / 3), BYTE_UNITS.length - 1)
  const numStr = removeFloatStringExtraZero((num / Math.pow(base, exponent)).toPrecision(3))

  return (neg ? '-' : '') + numStr + ' ' + BYTE_UNITS[exponent]
}

export function prettyCount(num: number): string {
  let suffix = ''
  let prefix: string

  if (num < 1000) {
    return num + ''
  } else if (num <= 10000) {
    prefix = (num / 1000).toPrecision(1)
    suffix = 'k'
  } else if (num <= 1000000) {
    prefix = (num / 10000).toPrecision(1)
    suffix = 'w'
  } else {
    return '100w+'
  }

  return removeFloatStringExtraZero(prefix) + suffix
}

export function prettyDatetime(ms: number, diff: number, format: string = 'yyyy-mm-dd'): string {
  if (diff < 1) return '刚刚'
  if (diff < 60) return diff + ' 秒前'

  let obj = formatElapsedSeconds(diff, {maxLevel: 'day'})
  if (diff < 3600) return obj.minute + ' 分前'
  if (diff < 86400) return obj.hour + ' 小时前'
  if (diff < 2592000) return obj.day + ' 天前'
  return formatDate(new Date(ms), format)
}

function removeFloatStringExtraZero(str: string): number {
  // if (str.indexOf('.') < 0) return str
  // return str
  //   .replace(/0+$/, '') // 去除小数后面无用的 0
  //   .replace(/\.$/, '') // 去除最后一个无用的小数点
  return Number(str)
}
