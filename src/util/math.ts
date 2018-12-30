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


/**
 * 获取两个数的最小公倍数 lowest common multiple
 *
 * @example
 * lcm(10, 4) => 20
 */
export function lcm(x: number, y: number): number {
  return (x * y) / gcd(x, y)
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

/**
 * 计算数组中的数字的平均值
 */
export function average(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0) / arr.length
}

/**
 * 计算数组中的数字的总和
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0)
}

/**
 * Rounds a number to a specified amount of digits
 *
 * Use Math.round() and template literals to round the number to the specified
 * number of digits. Omit the second argument, decimals to round to an integer.
 *
 * @example
 * round(1.005, 2) -> 1.01
 */
export function round(n: number, decimals: number = 0) {
  return Number(`${Math.round(`${n}e${decimals}` as any)}e-${decimals}`)
}


/**
 * 从数组中取 m 个组成的组合
 */
function c<T>(arr: T[], m: number): T[][] {
  let n = arr.length
  if (n < m || m < 1) return []
  if (m === 1) return arr.map(it => [it])

  let result: T[][] = []
  for (let i = 0; i < n; i++) {
    let start = arr[i]
    c(arr.slice(i + 1), m - 1).forEach(it => {
      result.push([start, ...it])
    })
  }
  return result
}

/**
 * 数组的组合
 *
 * 如果指定了 n，则表示从数组中取 n 个项的组合情况
 * 如果没指定 n，表示所有的组合情况
 */
export function combination<T>(arr: T[], n?: number) {
  if (n) return c(arr, n)
  let result: T[][] = []
  for (let i = 0; i < arr.length; i++) {
    result.push(...c(arr, i + 1))
  }
  return result
}


/**
 * 一个数组的所有排列可能
 */
function p<T>(arr: T[]): T[][] {
  let n = arr.length
  if (n === 0) return []
  if (n === 1) return [[...arr]]

  let result: T[][] = []
  for (let i = 0; i < n; i++) {
    let start = arr[i]
    let subResult = p([...arr.slice(0, i), ...arr.slice(i + 1, n)])
    result.push(...subResult.map(l => [start, ...l]))
  }
  return result
}

/**
 * 数组的排列
 *
 * 如果指定了 n，则表示从数组中取 n 个项的排列情况
 * 如果没指定 n，表示所有的排列情况
 */
export function permutation<T>(arr: T[], n?: number) {
  let result: T[][] = []
  combination(arr, n).forEach(list => {
    result.push(...p(list))
  })
  return result
}
