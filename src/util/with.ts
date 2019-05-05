import {ComponentType} from 'react'
import {Omit} from '../type/type'

/**
 * 给 Component 组件注入默认值
 *
 * @example
 *
 * class RawCounter extends React.Component<{value: number}> {}
 *
 * export const Counter = withDefaultProps({value: 0}, RawCounter)
 */
export function withDefaultProps<P extends object, DP extends Partial<P> = Partial<P>>(defaultProps: DP, Comp: ComponentType<P>) {
  type RequiredProps = Omit<P, keyof DP>
  // type Props = Partial<DP> & Required<RequiredProps>
  type Props = Partial<DP> & RequiredProps
  Comp.defaultProps = defaultProps

  return (Comp as ComponentType<any>) as ComponentType<Props>
}


export namespace withInject {
  export interface Return<T extends Function> {
    (Ctor: any): any
    to: T
  }

  /**
   * 指定需要排除的 K
   */
  export interface ComponentReturn<K> {
    (Ctor: any): any
    to: <T>(Ctor: React.ComponentType<T>) => React.ComponentType<Omit<T, K>>
  }
}

/**
 * 用 Decorators 修饰的组件不能修改原有的属性，而 Decorators 一般会给
 * 组件注入一些新的值，这些值不需要使用方填充，使用 Decorators 暂时做不到。
 *
 * 所以提供此方法来支持两种方式的调用(`@inject()` 和 `inject().to(Ctor)`)
 */
export function withInject<T extends Function>(withFn: T): withInject.Return<T> {
  let rtn = (Ctor: any) => withFn(Ctor) as any
  // @ts-ignore
  rtn.to = withFn
  return rtn as any
}
