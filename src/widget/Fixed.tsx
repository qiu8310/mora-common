import * as React from 'react'
import {classSet} from '../util/classSet'

import './style/Fixed.scss'

export interface IFixedProps {
  direction?: 'top' | 'bottom'
  holder?: boolean
  zIndex?: number
  height: number | string
  className?: string
  style?: React.CSSProperties
}

export class Fixed extends React.PureComponent<IFixedProps, any> {
  static defaultProps = {
    direction: 'bottom',
    zIndex: 100,
    holder: true
  }

  render() {
    let {direction, height, holder, zIndex, children, className, style} = this.props
    let contentStyle: any = {height, zIndex}

    if (direction === 'top') contentStyle.top = 0
    else contentStyle.bottom = 0

    return (
      <div className={classSet('wFixed', className)} style={style}>
        {holder ? <div className='fixedHolder' style={{height}} /> : null}
        <div className='fixedContent' style={contentStyle}>
          {children}
        </div>
      </div>
    )
  }
}
