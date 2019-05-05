import {hasOwnProp, isObject} from './object'
import {Dict} from '../type/type'

/**
 * 创建一个对象，使你可以通过 get/set/has/del 的方法来对其值
 * 做增删改查的操作，并且路径名支持 . 链接
 *
 * @class
 * @param {Objet} data  要操作的数据池
 *
 * @example
 * var dp = new DotProp({foo: {bar: 1}})
 * dp.has('foo.bar') // true
 * dp.get('foo')     // {bar: 1}
 * dp.set('x', 'x')  // true
 * dp.del('foo')     // true
 * dp.data           // {x: 'x'}
 *
 *
 * @see [dot-prop@3.0.0]{@link https://github.com/sindresorhus/dot-prop/tree/v3.0.0}
 */
export class DotProp {
  constructor(public data: Dict<any>) {}

  /** 获取数据池中路径为 path 的值 */
  get(path: string) {
    return getProp(this.data, path)
  }

  /**
   * 设置数据池中路径为 path 的值，如果中间的路径不存在，
   * 或者不为 Object，则自动添加或修改成 Object
   */
  set(path: string, value: any) {
    return setProp(this.data, path, value)
  }

  /**
   * 判断数据池中是否有路径 path
   */
  has(path: string) {
    return hasProp(this.data, path)
  }

  /**
   * 删除数据池中的路径上的值
   */
  del(path: string) {
    return delProp(this.data, path)
  }
}

/**
 * 判断数据池 obj 中是否有路径 path
 */
export function hasProp(obj: Dict<any>, path: string): boolean {
  if (!isObject(obj) || typeof path !== 'string') {
    return false
  }

  return find(obj, getPathSegments(path), data => {
    if (data.isDrained) {
      return {next: false, value: false}
    } else if (data.isLast) {
      return {next: false, value: true}
    } else {
      return {next: true}
    }
  })
}

/**
 * 获取数据池 obj 中的路径 path 中的值
 */
export function getProp(obj: Dict<any>, path: string): any {
  if (!isObject(obj) || typeof path !== 'string') {
    return obj
  }

  return find(obj, getPathSegments(path), data => {
    if (data.isDrained) {
      return {next: false, value: undefined}
    } else if (data.isLast) {
      return {next: false, value: data.current}
    } else {
      return {next: true}
    }
  })
}

/**
 * 删除数据池 obj 中的路径 path
 */
export function delProp(obj: Dict<any>, path: string): boolean {
  if (!isObject(obj) || typeof path !== 'string') {
    return false
  }

  return find(obj, getPathSegments(path), data => {
    if (data.isDrained) {
      return {next: false, value: false}
    } else if (data.isLast) {
      delete data.parent[data.segment]
      return {next: false, value: true}
    } else {
      return {next: true}
    }
  })
}

/**
 * 设置数据池 obj 中路径 path 的值为 value
 */
export function setProp(obj: Dict<any>, path: string, value: any): boolean {
  if (!isObject(obj) || typeof path !== 'string') {
    return false
  }

  return find(obj, getPathSegments(path), data => {
    let current = data.current
    let segment = data.segment
    if (data.isLast) {
      data.parent[segment] = value
      return {next: false, value: true}
    }

    if (!isObject(current)) {
      current = data.parent[segment] = {}
    }
    return {next: true, current}
  })
}

function find(
  obj: Dict<any>,
  segments: string[],
  fn: (arg: {
    isLast: boolean, isDrained: boolean, segment: string, parent: any, current: any
  }) => {value?: any, next: boolean, current?: any}
) {
  let len = segments.length
  let parent: any = null
  let current: any = obj
  let isDrained = false
  let i: number
  let segment: string
  let fnRtn: {value?: any, next: boolean, current?: string}
  let result: any

  for (i = 0; i < len; i++) {
    segment = segments[i]

    parent = current
    if (hasOwnProp(current, segment)) {
      current = current[segment]
    } else {
      current = null
      isDrained = true
    }

    fnRtn = fn({
      isLast: i === len - 1,
      isDrained,
      segment,
      parent,
      current
    })

    result = fnRtn.value

    if (!fnRtn.next) break
    else if ('current' in fnRtn) current = fnRtn.current // 回调更新了 current 对象
  }

  return result
}

function getPathSegments(path: string) {
  let p
  let parts = []
  let pathArr = path.split('.')

  for (let i = 0; i < pathArr.length; i++) {
    p = pathArr[i]

    while (p[p.length - 1] === '\\' && pathArr[i + 1] !== undefined) {
      p = p.slice(0, -1) + '.'
      p += pathArr[++i]
    }

    parts.push(p)
  }

  return parts
}
