import {warn} from './logger'

export interface IClassSetObjectArg {
  [className: string]: any
}
export declare type IClassSetArrayArg = string | IClassSetObjectArg
export declare type IClassSetArg = IClassSetObjectArg | IClassSetArrayArg[] | string | any

export function classSet(...args: IClassSetArg[]): string {
  const result: string[] = []
  args.forEach((arg) => {
    if (arg) {
      if (Array.isArray(arg)) result.push(classSet(...arg))
      else if (typeof arg === 'string') result.push(arg)
      else if (typeof arg === 'object') result.push(...(Object.keys(arg).filter(k => arg[k])))
    }
  })
  return result.join(' ')
}

/**
 * 针对 css-modules 和 classSet 使用
 *
 * @export
 * @param {any} locals - css-modules 导出的对象
 * @param {Array<IClassSetArg>} args - 传给 classSet 用的参数
 * @returns string
 */
export function classMap(locals: any, ...args: IClassSetArg[]): string {
  return classSet(...args).trim().split(/\s+/)
    .map(cls => {
      if (cls && locals.hasOwnProperty(cls)) return locals[cls]
      warn(`class "${cls}" not exists in %o`, locals)
    })
    .filter(cls => !!cls)
    .join(' ')
}
