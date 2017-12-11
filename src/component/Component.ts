import * as React from 'react'

export type IComponentProps<P = {}, DP = {}> = Readonly<{ children?: React.ReactNode }> & Readonly<P> & Readonly<DP>

/**
 * 如果组件下不会嵌入其它子组件，则建议不要使用 Component
 */
export class Component<P = {}, DP = {}, S = {}> extends React.Component<P, S> {
  p: IComponentProps<P, DP> = this.props as any
}

export {React}
