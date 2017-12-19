/**
 * 获取两个数的最大公约数  Greatest common divisor (GCD)
 *
 * Use recursion. Base case is when y equals 0. In this case, return x.
 * Otherwise, return the GCD of y and the remainder of the division x/y
 *
 * @example
 * gcd(10, 4) => 2
 */
export function gcd(x: number, y: number): number {
  return !y ? x : gcd(y, x % y)
}

const cache: {[key: string]: {[key: number]: number}} = {cos: {}, sin: {}, tan: {}}

export const DEGREE_TO_RADIAN_FRACTOR = Math.PI / 180

export function degree2radian(degree: number): number {
  return degree * DEGREE_TO_RADIAN_FRACTOR
}

export function xcos(degree: number): number {
  degree = period(degree, 360)
  if (cache.cos[degree] == null) cache.cos[degree] = Math.cos(degree2radian(degree))
  return cache.cos[degree]
}

export function xsin(degree: number): number {
  degree = period(degree, 360)
  if (cache.sin[degree] == null) cache.sin[degree] = Math.sin(degree2radian(degree))
  return cache.sin[degree]
}

export function xtan(degree: number): number {
  degree = period(degree, 180)
  if (cache.tan[degree] == null) cache.tan[degree] = Math.tan(degree2radian(degree))
  return cache.tan[degree]
}

export function between(value: number, min: number, max: number) {
  return Math.min(Math.max(min, value), max)
}

/**
 * 最小周期内的值
 *
 * @example
 *
 * period(3, 60)  -> 3
 * period(61, 60) -> 1
 */
export function period(value: number, length: number): number {
  if (value < 0) {
    return (value % length) + length
  } else if (value < length) {
    return value
  } else {
    return value % length
  }
}

/**
 * 返回一个 >= min && < max 的数
 */
export function random(min: number, max: number, integer: boolean): number {
  return integer
    ? Math.floor(Math.random() * (max - min + 1)) + min
    : Math.random() * (max - min) + min
}
