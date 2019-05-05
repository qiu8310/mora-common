import {Dict} from '../type/type'
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
 * Returns a random element from an array
 */
export function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
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

/**
 * Groups array elements by the key returned from the categorize function.
 */
export function groupBy<T>(arr: T[], categorize: (item: T, index: number, ref: T[]) => string) {
  let group: Dict<T[]> = {}
  arr.forEach((item, index, ref) => {
    let id = categorize(item, index, ref)
    if (!group.hasOwnProperty(id)) group[id] = [item]
    else group[id].push(item)
  })
  return group
}


export function min(arr: number[]): number
export function min<T>(arr: T[], iterator: (item: T, index: number, ref: T[]) => number): T | undefined
export function min<T>(arr: T[], iterator?: (item: T, index: number, ref: T[]) => number): T | undefined {
  let result: T | undefined
  let compare = Infinity
  arr.forEach((item, index, ref) => {
    let value = iterator ? iterator(item, index, ref) : ((item as any) as number)
    if (value < compare) {
      compare = value
      result = item
    }
  })
  return result
}


export function max(arr: number[]): number
export function max<T>(arr: T[], iterator: (item: T, index: number, ref: T[]) => number): T | undefined
export function max<T>(arr: T[], iterator?: (item: T, index: number, ref: T[]) => number): T | undefined {
  let result: T | undefined
  let compare = -Infinity
  arr.forEach((item, index, ref) => {
    let value = iterator ? iterator(item, index, ref) : ((item as any) as number)
    if (value > compare) {
      compare = value
      result = item
    }
  })
  return result
}


/**
 * Invokes the iteratee n times, returning an array of the results of each invocation. The iteratee is invoked with one argument; (index).
 */
export function times<T>(n: number, iteratee: T | ((n: number) => T)) {
  let i = -1
  let res: T[] = []
  let isFn = typeof iteratee === 'function'
  while (++i < n) {
    res.push(isFn ? (iteratee as any)(i) : iteratee)
  }
  return res
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
