import * as React from 'react'

import './style/Fixed.scss'

export interface IFixedProps {
  direction?: 'top' | 'bottom'
  holder?: boolean
  zIndex?: number
  height: number | string
}

export default class Fixed extends React.PureComponent<IFixedProps, any> {
  static defaultProps = {
    direction: 'bottom',
    zIndex: 100,
    holder: true
  }

  render() {
    let {direction, height, holder, zIndex, children} = this.props
    let style: any = {height, zIndex}

    if (direction === 'top') style.top = 0
    else style.bottom = 0

    return (
      <div className='wFixed'>
        {holder ? <div className='fixedHolder' style={{height}} /> : null}
        <div className='fixedContent' style={style}>
          {children}
        </div>
      </div>
    )
  }
}
