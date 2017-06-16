export interface IClassSetObjectArg {
  [className: string]: any
}
export declare type IClassSetArrayArg = string | IClassSetObjectArg
export declare type IClassSetArg = IClassSetObjectArg | IClassSetArrayArg[] | string | any

export default function classSet(...args: IClassSetArg[]): string {
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
