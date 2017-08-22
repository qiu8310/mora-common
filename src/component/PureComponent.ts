import * as React from 'react'

import Component from './Component'
import applyMixins from '../util/applyMixins'

class PureComponent<P> extends React.PureComponent<P, any> implements Component<P> {
  // 当前 loading 状态
  loading: boolean

  // 将 state.loading 设置成 true
  doLoading: (data?: any, cb?: () => void) => void

  // 将 state.loading 设置成 false
  doneLoading: (data?: any, cb?: () => void) => void
}

applyMixins(PureComponent, [Component])

export default PureComponent
