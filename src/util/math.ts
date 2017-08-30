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
