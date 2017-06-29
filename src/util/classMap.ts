import {default as classSet, IClassSetArg} from './classSet'
import warn from './warn'

/**
 * 针对 css-modules 和 classSet 使用
 *
 * @export
 * @param {any} locals - css-modules 导出的对象
 * @param {Array<IClassSetArg>} args - 传给 classSet 用的参数
 * @returns string
 */
export default function classMap(locals: any, ...args: IClassSetArg[]): string {
  return classSet(...args).trim().split(/\s+/)
    .map(cls => {
      if (cls && locals.hasOwnProperty(cls)) return locals[cls]
      warn(`class "${cls}" not exists in %o`, locals)
    })
    .filter(cls => !!cls)
    .join(' ')
}
