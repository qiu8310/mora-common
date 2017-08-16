// 依赖于 react-transition-group@1.x.x
// 作为 TransitionGroup 的 child 使用，参考 Modal widget

import * as React from 'react'
import onTransitionEnd from '../dom/onTransitionEnd'
import {TransitionGroup} from 'react-transition-group'

export interface ITransitionGroupItemProps {
  name: string

  component?: string
  componentProps?: any
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

export class TransitionGroupItem extends React.PureComponent<ITransitionGroupItemProps, any> {
  static defaultProps = {
    component: 'div',
    componentProps: {},
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
    this['_will_' + type] = true
    if (!this.props[type]) return callback()
    this.call('before', type)

    let {el, props} = this
    let {name} = props
    el.classList.add(name + props[type + 'Suffix'])
    setTimeout(() => {
      this.reflow()
      el.classList.add(name + props[type + 'ActiveSuffix'])
      onTransitionEnd(el, callback)
    }, 16)
  }
  did(type) {
    let {el, props} = this
    let {name} = props

    if (!props[type]) return
    if (!el) return // 很奇怪，有时候组件已经消失了，还会多余地调用一次 did
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
    let {component, componentProps, className, style, children} = this.props
    let ref = e => this.el = e
    let props = {ref, className, style, ...componentProps}
    return React.createElement(component, props, children)
    // return <span ref={e => this.el = e} className={className} style={style} children={children} />
  }
}

export interface ITransition extends ITransitionGroupItemProps {
  itemKey: string | number
}

export default class Transition extends React.PureComponent<ITransition, any> {
  render() {
    let {itemKey: key, ...rest} = this.props
    return <TransitionGroup>
      <TransitionGroupItem key={key} {...rest} />
    </TransitionGroup>
  }
}
