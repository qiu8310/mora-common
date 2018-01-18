import * as React from 'react'

import {Component, IComponentProps} from './Component'
import {applyMixins} from '../util/applyMixins'

export type IPureComponentProps<P = {}, DP = {}> = IComponentProps<P, DP>

/**
 * 如果组件下会嵌入其它子组件，则建议不要使用 PureComponent
 */
class PureComponent<P = {}, DP extends Partial<P> = {}, S = {}> extends React.PureComponent<P, S> implements Component<P, DP, S> {
  props: IPureComponentProps<P, DP> = this.props as any
}

applyMixins(PureComponent, [Component])
