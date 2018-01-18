import * as React from 'react'

export type IComponentProps<P = {}, DP = {}> = Readonly<{ children?: React.ReactNode }> & Readonly<P> & Readonly<DP>

/**
 * 如果组件下不会嵌入其它子组件，则建议不要使用 Component
 */
export class Component<P = {}, DP extends Partial<P> = {}, S = {}> extends React.Component<P, S> {
  props: IComponentProps<P, DP> = this.props as any
}

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11640#issuecomment-355270345
// export declare class ComponentWithDefaultProps<P = {}, DP extends Partial<P> = {}, S = {}> extends React.Component<P & DP, S> {}
// type redirected<P = {}, DP = {}, S = {}> = ComponentWithDefaultProps<P, DP, S>
// const redirected: typeof ComponentWithDefaultProps = React.Component as any
// export const Component = redirected

