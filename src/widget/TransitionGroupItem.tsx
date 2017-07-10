import * as React from 'react'
import onTransitionEnd from '../dom/onTransitionEnd'

export interface ITransitionGroupItemProps {
  name: string

  className?: string
  style?: React.CSSProperties

  appear?: boolean
  appearSuffix?: string
  appearActiveSuffix?: string
  beforeAppear?: (el: HTMLSpanElement) => any
  afterAppear?: (el: HTMLSpanElement) => any

  enter?: boolean
  enterSuffix?: string
  enterActiveSuffix?: string
  beforeEnter?: (el: HTMLSpanElement) => any
  afterEnter?: (el: HTMLSpanElement) => any

  leave?: boolean
  leaveSuffix?: string
  leaveActiveSuffix?: string
  beforeLeave?: (el: HTMLSpanElement) => any
  afterLeave?: (el: HTMLSpanElement) => any
}

export default class TransitionGroupItem extends React.PureComponent<ITransitionGroupItemProps, any> {
  static defaultProps = {
    appear: false,
    appearSuffix: 'Appear',
    appearActiveSuffix: 'AppearActive',
    enter: true,
    enterSuffix: 'Enter',
    enterActiveSuffix: 'EnterActive',
    leave: true,
    leaveSuffix: 'Leave',
    leaveActiveSuffix: 'LeaveActive'
  }

  private el: HTMLSpanElement

  reflow() {
    /* tslint:disable */
    this.el.scrollTop
    /* tslint:enable */
  }

  call(location, type) {
    let fn = this.props[location + type[0].toUpperCase() + type.slice(1)]
    if (typeof fn === 'function') fn(this.el)
  }

  will(type, callback) {
    this.call('before', type)
    if (!this.props[type]) callback()

    let {el, props} = this
    let {name} = props

    el.classList.add(name + props[type + 'Suffix'])
    this.reflow()
    el.classList.add(name + props[type + 'ActiveSuffix'])
    onTransitionEnd(el, callback)
  }
  did(type) {
    let {el, props} = this
    let {name} = props

    el.classList.remove(name + props[type + 'Suffix'])
    el.classList.remove(name + props[type + 'ActiveSuffix'])
    this.call('after', type)
  }

  componentWillAppear(callback) {
    this.will('appear', callback)
  }

  componentDidAppear() {
    this.did('appear')
  }

  componentWillEnter(callback) {
    this.will('enter', callback)
  }
  componentDidEnter() {
    this.did('enter')
  }

  componentWillLeave(callback) {
    this.will('leave', callback)
  }
  componentDidLeave() {
    this.did('leave')
  }

  render() {
    let {className, style, children} = this.props
    return <span ref={e => this.el = e} className={className} style={style} children={children} />
  }
}
