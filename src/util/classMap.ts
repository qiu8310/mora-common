import {default as classSet, IClassSetArg} from './classSet'

export interface ICssModuleLocalsInterface {
  [className: string]: string
}

/**
 * 针对 css-modules 和 classSet 使用
 *
 * @export
 * @param {ICssModuleLocalsInterface} locals - css-modules 导出的对象
 * @param {Array<IClassSetArg>} args - 传给 classSet 用的参数
 * @returns string
 */
export default function classMap(locals: ICssModuleLocalsInterface, ...args: IClassSetArg[]): string {
  return classSet(...args).trim().split(/\s+/)
    .map(cls => {
      if (cls && locals.hasOwnProperty(cls)) return locals[cls]
      if (process.env.NODE_ENV !== 'production') console.warn(`class "${cls}" not exists in %o`, locals)
    })
    .filter(cls => !!cls)
    .join(' ')
}
