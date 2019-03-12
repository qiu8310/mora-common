import {iterateInheritedPrototype} from './iterateInheritedPrototype'

export interface IClassInstanceToObjectOptions {
  /**
   * 将所有的对象中的函数绑定到指定的对象上
   *
   * **注意：对象中的箭头函数无法重新绑定**
   */
  bindTo?: any

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

  /**
   * 生成的新对象的键值是否需要 enumerable， 0 表示使用原本的配置，此值默认为 true
   */
  enumerable?: 0 | boolean
  /**
   * 生成的新对象的键值是否需要 configurable， 不指定或指定 0 则使用原本的
   */
  configurable?: 0 | boolean
  /**
   * 生成的新对象的键值是否需要 writable，不指定或指定 0 则使用原本的
   */
  writable?: 0 | boolean
}

/**
 *
 * 将一个可能包含原型链的对象扁平化成单个对象
 *
 * 如，现有这样的类的继承关系 A -> B -> C，当创建一个实例 a = new A() 时
 *
 * a 实例会存有 B、C 的原型链，使用此函数 newa = toObject(a) 之后，
 * newa 就会变成一个 PlainObject，但它有 A、B、C 上的所有属性和方法，
 * 当然不包括静态属性或方法
 *
 * 注意1：用此方法的话，尽量避免在类中使用胖函数，胖函数的 this 死死的绑定
 * 在原对象中，无法重新绑定
 *
 * 注意2：类继承的时候不要在函数中调用 super，toObject 之后是扁平的，没有 super 之说
 */
export function toObject(something: any, options: IClassInstanceToObjectOptions = {}): {[key: string]: any} {
  let obj = {}
  if (!isObject(something)) return obj

  let excludes = options.excludes || ['constructor']
  let {enumerable = true, configurable = 0, writable = 0} = options
  let defaultDesc: PropertyDescriptor = {}
  if (enumerable !== 0) defaultDesc.enumerable = enumerable
  if (configurable !== 0) defaultDesc.configurable = configurable as boolean
  if (writable !== 0) defaultDesc.writable = writable as boolean

  iterateInheritedPrototype((proto) => {
    Object.getOwnPropertyNames(proto).forEach(key => {
      if (excludes.indexOf(key) >= 0) return
      if (obj.hasOwnProperty(key)) return
      let desc = Object.getOwnPropertyDescriptor(proto, key) as PropertyDescriptor

      let fnKeys = ['get', 'set', 'value'] as Array<'get'>
      fnKeys.forEach((k) => {
        if (typeof desc[k] === 'function') {
          let oldFn = desc[k] as any
          desc[k] = function(...args: any[]) {
            return oldFn.apply(options.hasOwnProperty('bindTo') ? options.bindTo : this, args)
          }
        }
      })
      Object.defineProperty(obj, key, {...desc, ...defaultDesc})
    })
  }, something, options.till || Object, false)

  return obj
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * 除了 null, 及字面量，其它一般都是 Object，包括函数
 *
 * **如果只需要判断是不是纯 Object，请使用 `isPlainObject`**
 *
 * @example
 *
 * isObject({})
 * // => true
 *
 * isObject([1, 2, 3])
 * // => true
 *
 * isObject(Function)
 * // => true
 *
 * isObject(null)
 * // => false
 */
export function isObject(something: any): something is any {
  let type = typeof something
  return something !== null && (type === 'function' || type === 'object')
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * isObjectLike({})
 * // => true
 *
 * isObjectLike([1, 2, 3])
 * // => true
 *
 * isObjectLike(Function)
 * // => false
 *
 * isObjectLike(null)
 * // => false
 */
export function isObjectLike(value: any) {
  return typeof value === 'object' && value !== null
}

/**
 * 判断 something 是不是一个原生的 Object
 */
export function isPlainObject(something: any): something is {[key: string]: any} {
  return toString(something) === '[object Object]'
}

/**
 * 判断 obj 是否是空（即不含任何 keys）
 *
 * 需要保证参数是一个 PlainObject
 */
export function isPlainObjectEmpty<T extends object>(obj: T) {
  if (!isPlainObject(obj)) throw new Error('argument is not a plain object')
  return Object.keys(obj).length === 0
}

/**
 * 从一个对象中取出需要的属性，组成一个新对象
 */
export function pick<T>(obj: T, keys: Array<keyof T>) {
  let res: Partial<T> = {};
  (Object.keys(obj) as Array<keyof T>).forEach(k => {
    if (keys.indexOf(k) >= 0) res[k] = obj[k]
  })
  return res
}

/**
 * 从一个对象中排除指定的 keys，返回一个新对象
 */
export function omit<T>(obj: T, keys: Array<keyof T>) {
  let res: Partial<T> = {};
  (Object.keys(obj) as Array<keyof T>).forEach(k => {
    if (keys.indexOf(k) < 0) res[k] = obj[k]
  })
  return res
}

/**
 * 获取 something 对象的原生的 toString 的结果
 */
export function toString(something: any) {
  return Object.prototype.toString.call(something)
}


/**
 * 判断 obj 对象是否含有某个 key （ 利用 hasOwnProperty ）
 */
export function hasOwnProp<T extends object>(obj: T, key: string) {
  if (obj == null) return false
  return Object.prototype.hasOwnProperty.call(obj, key)
}


/**
 * 深度合并 sources 对象到 target 上
 */
export function deepMerge(target: any, ...sources: any[]) {
  sources.forEach(source => {
    if (source) {
      for (const s in source) {
        if (source.hasOwnProperty(s)) {
          const value = source[s]
          if (isPlainObject(value) && isPlainObject(target[s])) {
            target[s] = deepMerge(target[s], value)
          } else {
            target[s] = value
          }
        }
      }
    }
  })
  return target
}
