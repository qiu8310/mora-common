import {toArray, head} from './array'

/**
 * 保证函数 fn 只会被调用一次，并且以后每次调用都会返回第一次的结果
 *
 * @example
 *
 * once(() => {  })             // 返回一个函数
 */
export function once(fn: (...args: any[]) => any): (...args: any[]) => any

/**
 * 保证函数 fns 中的所有函数只会被调用一次，并且以后每次调用都会返回第一次被调用的函数的结果
 *
 * @example
 *
 * once([() => {}, () => {}, ...])   // 返回一个函数数组
 */
export function once(fns: Array<(...args: any[]) => any>): Array<(...args: any[]) => any>

export function once(fns: any): any {
  let called = false
  let result: any

  let isArray = Array.isArray(fns)

  let newFns = toArray(fns).map((fn) => function(this: any, ...args: any[]) {
    if (called) return result
    called = true
    result = fn.apply(this, args)
    return result
  })

  return isArray ? newFns : head(newFns)
}
