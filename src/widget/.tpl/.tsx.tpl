/**
 * Create by $user at $datetime
 */

import * as React from 'react'
import {classSet} from '../util/classSet'

export interface I$ufModuleName {
  className?: string
  style?: React.CSSProperties
}

export class $ufModuleName extends React.PureComponent<I$ufModuleName, any> {
  static defaultProps = {

  }

  render() {
    let {className, style} = this.props

    return (
      <div className={classSet('w$ufModuleName', className)} style={style}>

      </div>
    )
  }
}
