import {iterateInheritedPrototype} from './iterateInheritedPrototype'

export interface IClassInstanceToObjectOptions {
  /**
   * 要排除的键名
   *
   * 默认： ['constructor']
   */
  excludes?: string[]

  /**
   * 递归遍历到的终点对象或class(不会遍历终点对象上的属性)
   *
   * 默认： Object
   */
  till?: any
}

export function toObject(something: any, options: IClassInstanceToObjectOptions = {}): {[key: string]: any} {
  let obj = {}
  if (!isObject(something)) return obj

  let excludes = options.excludes || ['constructor']

  iterateInheritedPrototype((proto) => {
    Object.keys(proto).forEach(key => {
      if (excludes.indexOf(key) >= 0) return
      if (obj.hasOwnProperty(key)) return
      let desc = Object.getOwnPropertyDescriptor(proto, key) as PropertyDescriptor

      let fnKeys = ['get', 'set', 'value'] as Array<'get'>
      fnKeys.forEach((k) => {
        if (typeof desc[k] === 'function') {
          let oldFn = desc[k] as any
          desc[k] = (...args: any[]) => {
            return oldFn.apply(obj, args)
          }
        }
      })

      Object.defineProperty(obj, key, desc)
    })
  }, something, options.till || Object, false)

  return obj
}

/**
 * 判断 something 是不是一个 JS Object (从 mora-script 中取过来的)
 *
 * 除了 null, 及字面量，其它一般都是 Object，包括 函数
 */
export function isObject(something: any) {
  let type = typeof something
  return something !== null && (type === 'function' || type === 'object')
}
