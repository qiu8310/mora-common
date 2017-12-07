import * as React from 'react'

export interface IComponentState {
  loading: boolean
}

export class Component<P = {}, S extends IComponentState = IComponentState> extends React.Component<P, S> {
  /**
   * 当前 loading 状态
   */
  get loading() { return !!this.state.loading }


  /**
   * 将 state.loading 设置成 true
   */
  doLoading<K extends keyof S>(state?: Pick<S, K>, cb?: () => any) {
    this.setState({...(state || {}), loading: true}, cb)
  }

  /**
   * 将 state.loading 设置成 false
   */
  doneLoading<K extends keyof S>(state?: Pick<S, K>, cb?: () => any) {
    this.setState({...(state || {}), loading: false}, cb)
  }
}
