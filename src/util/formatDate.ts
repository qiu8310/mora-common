let MONTHS = [
  ['Jan', 'January'],
  ['Feb', 'February'],
  ['Mar', 'March'],
  ['Apr', 'April'],
  ['May', 'May'],
  ['Jun', 'June'],
  ['Jul', 'July'],
  ['Aug', 'August'],
  ['Sep', 'September'],
  ['Oct', 'October'],
  ['Nov', 'November'],
  ['Dec', 'December']
]
let WEEKS = [
  ['Sun', 'Sunday'],
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday']
]

// 注意，要把长的放前面，表示优先匹配
let gre = /(?:yyyy|yy|mm|m|MM|M|dd|d|DD|Do|D|HH|H|hh|h|A|a|ii|i|ss|s|X|x)/g

/**
 * 格式化日期
 *
 * @param format  格式字符串，支持如下格式（以 2014-01-02 04:05:06 为例）：
 *
 *  FORMAT  |       EXAMPLE
 *  --------|----------------
 *  yyyy    |       2014
 *  yy      |       14
 *  m, mm   |       1, 01
 *  M, MM   |       Jan, January
 *  d, dd   |       2, 02
 *  D, DD   |       Thur, Thursday
 *  Do      |       2nd（Day of month with ordinal: 1st..31st）
 *  H, HH   |       4, 04（24 hour time)
 *  h, hh   |       4, 04 (12 hour time used with `a A`)
 *  a, A    |       am, AM
 *  i, ii   |       5, 05
 *  s, ss   |       6, 06
 *  x       |       1388646306
 *  X       |       1388646306346
 *
 * @return 格式化后的日期
 *
 * @example
 *
 * formatDate('yyyy-mm-dd HH:ii:ss')
 * // 2016-07-08 15:03:02
 */
export function formatDate(format: string): string

/**
 * 格式化日期
 *
 * @param date  要格式化的日期，如果不传则使用当前日期
 * @param format  格式字符串，支持如下格式（以 2014-01-02 04:05:06 为例）：
 *
 *  FORMAT  |       EXAMPLE
 *  --------|----------------
 *  yyyy    |       2014
 *  yy      |       14
 *  m, mm   |       1, 01
 *  M, MM   |       Jan, January
 *  d, dd   |       2, 02
 *  D, DD   |       Thur, Thursday
 *  Do      |       2nd（Day of month with ordinal: 1st..31st）
 *  H, HH   |       4, 04（24 hour time)
 *  h, hh   |       4, 04 (12 hour time used with `a A`)
 *  a, A    |       am, AM
 *  i, ii   |       5, 05
 *  s, ss   |       6, 06
 *  x       |       1388646306
 *  X       |       1388646306346
 *
 * @return 格式化后的日期
 *
 * @example
 *
 * formatDate(new Date(), 'h:ii A')
 * // 8:30 AM
 */
export function formatDate(date: Date, format: string): string

export function formatDate(raw1: string | Date, raw2?: string): string {
  let date = typeof raw1 === 'string' ? new Date() : raw1
  let format = (raw2 || raw1) as string

  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()
  let week = date.getDay()

  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  let h = hour % 12
  let a = hour > 11 ? 'pm' : 'am'

  // @ts-ignore
  return format.replace(gre, key => {
    switch (key) {
      case 'yyyy': return year
      case 'yy': return year.toString().substr(2)
      case 'mm': return pad(month + 1)
      case 'm': return month + 1
      case 'MM': return MONTHS[month][1]
      case 'M': return MONTHS[month][0]
      case 'dd': return pad(day)
      case 'd': return day
      case 'DD': return WEEKS[week][1]
      case 'D': return WEEKS[week][0]
      case 'Do': return order(day)
      case 'HH': return pad(hour)
      case 'H': return hour
      case 'hh': return pad(h)
      case 'h': return h
      case 'a': return a
      case 'A': return a.toUpperCase()
      case 'ii': return pad(minute)
      case 'i': return minute
      case 'ss': return pad(second)
      case 's': return second
      case 'x': return Math.round(date.getTime() / 1000)
      case 'X': return date.getTime()
      /* istanbul ignore next 正则是精确匹配，不可能出现下面情况 */
      default: return key
    }
  })
}

function pad(num: number) {
  return (num < 10 ? '0' : '') + num
}

function order(day: number) {
  let prefix = day.toString()
  let suffix = 'th'

  // tslint:disable
  let map: any = {'1': 'st', '2': 'nd', '3': 'rd'}
  // tslint:enable

  if (day < 4 || day > 20) {
    suffix = map[prefix.slice(-1)] || 'th'
  }

  return prefix + suffix
}
