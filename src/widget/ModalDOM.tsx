import * as React from 'react'
import {Transition} from '../widget/Transition'
import {classSet} from '../util/classSet'
import {OutsideClickable} from '../component/implements/OutsideClickable'
import {KeyboardEvents} from '../component/implements/KeyboardEvents'
import {assignStyle} from '../dom/style'

import './style/ModalDOM.scss'

export interface IModalDOMPropsWithoutEvents {
  className?: string
  style?: React.CSSProperties

  // 动画相关
  itemKey?: string | number
  animation?: string
  animationDuration?: string

  // Modal 大小相关
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number

  // mask 相关
  nomask?: boolean
  maskTransparent?: boolean
  maskClickThrough?: boolean

  children?: React.ReactNode
}

export interface IModalDOMProps extends IModalDOMPropsWithoutEvents {
  /** 指定了 maskClickThrough 就不要指定 onClickMask 了 */
  onClickMask?: (e: React.MouseEvent<any>) => void
  onClickOutside?: (e: MouseEvent) => void
  onPressESC?: (e: KeyboardEvent) => void
}

@KeyboardEvents.apply()
@OutsideClickable.apply()
export class ModalDOM extends React.PureComponent<IModalDOMProps, any> implements OutsideClickable {
  static defaultProps = {
    animation: 'zoomIn',
    animationDuration: '0.5s',
    minWidth: 200,
    maxWidth: '90%',
    minHeight: 100,
    maxHeight: '90%'
  }

  keyboard = {
    esc: (e) => {
      const {onPressESC} = this.props
      if (onPressESC) onPressESC(e)
    }
  }

  getInsideContainer: any
  onClickOutside(e) {
    const {onClickOutside} = this.props
    if (onClickOutside) onClickOutside(e)
  }

  get mask() {
    const {nomask, onClickMask, maskTransparent, maskClickThrough} = this.props
    if (nomask) return null
    return <div
      onClick={onClickMask}
      className={classSet('modalMask gOverlay', maskClickThrough ? 'gClickThrough' : 'gClickable')}
      style={maskTransparent ? {background: 'transparent'} : null}
    />
  }

  get content() {
    const {width, height, minWidth, maxWidth, minHeight, maxHeight, children} = this.props
    return (
      <div className='modalContentWrap gOverlay gHVCenterChildren'>
        <div style={{width, height, minWidth, maxWidth, minHeight, maxHeight}} className='modalContent gClickable'>
          {children}
        </div>
      </div>
    )
  }

  get animateContent() {
    const {animation: animationName, animationDuration, itemKey} = this.props
    const {content} = this
    if (!animationName) return content
    return (
      <Transition
        className='gOverlay gInEffect'
        itemKey={itemKey}
        name={animationName}
        leave={false}
        appear={true}
        beforeAppear={el => assignStyle(el, {animationName, animationDuration})}
      >
        {content}
      </Transition>
    )
  }

  render() {
    const {className, style} = this.props
    const {animateContent, mask} = this
    return (
      <div className={classSet('wModalDOM gOverlay gClickThrough', className)} style={style}>
        {mask}
        {animateContent}
      </div>
    )
  }
}
