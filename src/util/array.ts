/**
 * 将单个元素转化成数组，保证结果一定是个数据
 *
 * 注意，不要用在 toArray(arguments) 上
 */
export function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item]
}

/**
 * 对数组去重
 */
export function unique<T, K extends keyof T>(items: T[], uniqueKey?: K): T[] {
  return items.reduce((result, item) => {
    if (uniqueKey) {
      if (result.every(_ =>  _[uniqueKey] !== item[uniqueKey])) result.push(item)
    } else {
      if (result.indexOf(item) < 0) result.push(item)
    }
    return result
  }, [] as T[])
}

/**
 * 打乱数据
 *
 * 先给每项生成一个随机数，再对随机数进行排序
 */
export function shuffle<T>(arr: T[]): T[] {
  let r: Array<{key: T, value: number}> = arr.map(v => ({key: v, value: Math.random()}))
  return r.sort((a, b) => a.value - b.value).map(v => v.key)
}

/**
 * Head of list
 *
 * return arr[0]
 */
export function head<T>(arr: T[]): T {
  return arr[0]
}

/**
 * Last of list
 */
export function last<T>(arr: T[]): T {
  return arr.slice(-1)[0]
}

/**
 * 初始化一个数字组成的数组
 */
export function initial(end: number, start: number = 0): number[] {
  return Array.apply(null, Array(end - start)).map( (v: any, i: number) => i + start )
}

/**
 * Use reduce() combined with map() to iterate over elements and
 * combine into an array containing all combinations.
 *
 * @example
 *
 * powerset([1,2]) -> [[], [1], [2], [2,1]]
 */
export function powerset<T>(arr: T[]): T[][] {
  return arr.reduce( (a, v) => a.concat(a.map( r => [v].concat(r) )), [[]] as T[][])
}


/**
 * Flatten array
 *
 * Use reduce() to get all elements inside the array and concat() to flatten them
 *
 * @example
 *
 * flatten([1,[2],3,4]) -> [1,2,3,4]
 */
export function flatten<T>(arr: any[]): T[] {
  return arr.reduce((a, v) => a.concat(v), [])
}
