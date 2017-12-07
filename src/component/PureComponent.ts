import * as React from 'react'

import {Component, IComponentState} from './Component'
import {applyMixins} from '../util/applyMixins'

export interface IPureComponentState extends IComponentState {

}

class PureComponent<P = {}, S extends IPureComponentState = IPureComponentState> extends React.PureComponent<P, S> implements Component<P, S> {
  /**
   * 当前 loading 状态
   */
  readonly loading: boolean

  /**
   * 将 state.loading 设置成 true
   */
  doLoading: <K extends keyof S>(state: Pick<S, K>, callback?: () => any) => void

  /**
   * 将 state.loading 设置成 false
   */
  doneLoading: <K extends keyof S>(state: Pick<S, K>, callback?: () => any) => void
}

applyMixins(PureComponent, [Component])

export {PureComponent}
