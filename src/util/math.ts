/**
 * 获取两个数的最大公约数
 *
 * @example
 * getHighestDivisor(10, 4) => 2
 */
export function getHighestDivisor(a: number, b: number): number {
  let c: number

  if (a < b) {
    [a, b] = [b, a]
  }

  /* tslint:disable */
  while ((c = a % b)) {
    a = b
    b = c
  }
  /* tslint:enable */
  return b
}

const cache: {[key: string]: {[key: number]: number}} = {cos: {}, sin: {}, tan: {}}

export const DEGREE_TO_RADIAN_FRACTOR = Math.PI / 180
export function degree2radian(degree: number): number {
  return degree * DEGREE_TO_RADIAN_FRACTOR
}
export function xcos(degree: number): number {
  degree = circle(degree, 360)
  if (cache.cos[degree] == null) cache.cos[degree] = Math.cos(degree2radian(degree))
  return cache.cos[degree]
}
export function xsin(degree: number): number {
  degree = circle(degree, 360)
  if (cache.sin[degree] == null) cache.sin[degree] = Math.sin(degree2radian(degree))
  return cache.sin[degree]
}
export function xtan(degree: number): number {
  degree = circle(degree, 180)
  if (cache.tan[degree] == null) cache.tan[degree] = Math.tan(degree2radian(degree))
  return cache.tan[degree]
}

export function between(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), max)
}

export function circle(value: number, period: number): number {
  if (value < 0) {
    return (value % period) + period
  } else if (value < period) {
    return value
  } else {
    return value % period
  }
}
