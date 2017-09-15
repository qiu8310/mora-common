const LEVELS = [
  {key: 'second', rate: 1},
  {key: 'minute', rate: 60},
  {key: 'hour', rate: 3600},
  {key: 'day', rate: 86400}
]

export interface IFormatElapsedSecondsOptions {
  maxLevel?: 'second' | 'minute' | 'hour' | 'day'
  maxValue?: number
}

export default function(seconds: number, options: IFormatElapsedSecondsOptions = {}): {second: number, minute: number, hour: number, day: number} {
  let {maxLevel = 'hour', maxValue} = options

  let maxIndex = -1
  LEVELS.some((l, i) => {
    if (l.key === maxLevel) {
      maxIndex = i
      return true
    }
  })

  return LEVELS
    .slice(0, maxIndex === -1 ? LEVELS.length : maxIndex + 1)
    .reverse()
    .reduce((res, level) => {
      let value = 0
      if (seconds >= level.rate) {
        value = Math.floor(seconds / level.rate)
        seconds -= value * level.rate
      }
      res[level.key] = maxValue > 0 ? Math.min(maxValue, value) : value
      return res
    }, {}) as any
}
