/**
 * Use Array.reduce() to pass value through functions
 *
 * @example
 *
 * pipe(btoa, x => x.toUpperCase())("Test") -> "VGVZDA=="
 */
export function pipe(...funcs: Array<(arg: any) => any>): (arg: any) => any {
  return (arg: any) => funcs.reduce((acc, func) => func(acc), arg)
}
