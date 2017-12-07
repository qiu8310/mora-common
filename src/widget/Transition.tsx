// 依赖于 react-transition-group@1.x.x
// 作为 TransitionGroup 的 child 使用，参考 Modal widget

import * as React from 'react'
import {onTransitionEnd} from '../dom/onTransitionEnd'
import * as TransitionGroup from 'react-transition-group/TransitionGroup'
import { IReactComponentRenderResult } from '../type/React'

export interface ITransitionGroupItemProps {
  name: string

  component?: string
  componentProps?: any
  className?: string
  style?: React.CSSProperties

  appear?: boolean
  appearSuffix?: string
  appearActiveSuffix?: string
  beforeAppear?: (el: HTMLElement) => any
  onAppear?: (el: HTMLElement) => any
  afterAppear?: (el: HTMLElement) => any

  enter?: boolean
  enterSuffix?: string
  enterActiveSuffix?: string
  beforeEnter?: (el: HTMLElement) => any
  onEnter?: (el: HTMLElement) => any
  afterEnter?: (el: HTMLElement) => any

  leave?: boolean
  leaveSuffix?: string
  leaveActiveSuffix?: string
  beforeLeave?: (el: HTMLElement) => any
  onLeave?: (el: HTMLElement) => any
  afterLeave?: (el: HTMLElement) => any
}

export {TransitionGroup}
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

  private el: HTMLElement

  reflow(el: HTMLElement) {
    /* tslint:disable */
    el.scrollTop
    /* tslint:enable */
  }

  call(location: string, type: string) {
    let fn = (this.props as any)[location + type[0].toUpperCase() + type.slice(1)]
    if (typeof fn === 'function') fn(this.el)
  }

  will(type: string, callback: () => void) {
    // this['_will_' + type] = true
    if (!(this.props as any)[type]) return callback()

    let {el, props} = this as any
    let {name} = props

    this.call('before', type)
    el.classList.add(name + props[type + 'Suffix'])
    setTimeout(() => {
      this.reflow(el)
      this.call('on', type)
      el.classList.add(name + props[type + 'ActiveSuffix'])
      onTransitionEnd(el, callback)
    }, 16)
  }
  did(type: string) {
    let {el, props} = this as any
    let {name} = props

    if (!props[type]) return
    if (!el) return // 很奇怪，有时候组件已经消失了，还会多余地调用一次 did
    el.classList.remove(name + props[type + 'Suffix'])
    el.classList.remove(name + props[type + 'ActiveSuffix'])
    this.call('after', type)
  }

  componentWillAppear(callback: () => void) {
    this.will('appear', callback)
  }

  componentDidAppear() {
    this.did('appear')
  }

  componentWillEnter(callback: () => void) {
    this.will('enter', callback)
  }
  componentDidEnter() {
    this.did('enter')
  }

  componentWillLeave(callback: () => void) {
    this.will('leave', callback)
  }
  componentDidLeave() {
    this.did('leave')
  }

  render() {
    let {component, componentProps, className, style, children} = this.props
    let ref = (e: HTMLElement) => this.el = e
    let props = {ref, className, style, ...componentProps}
    return React.createElement(component as string, props, children)
    // return <span ref={e => this.el = e} className={className} style={style} children={children} />
  }
}

export interface ITransition extends ITransitionGroupItemProps {
  itemKey?: string | number
  /** 切换到只显示单个 item 的模式, itemKey 则应该是 items 的当前显示的 item 的索引；提供了此字段便不需要 children */
  items?: IReactComponentRenderResult[]
  groupProps?: TransitionGroup.TransitionGroupProps
}

export class Transition extends React.PureComponent<ITransition, any> {
  static defaultProps = {
    groupProps: {
      component: 'div'
    }
  }

  render() {
    let {itemKey: key, items, groupProps, ...rest} = this.props

    if (!rest.name) return rest.children as any // 如果没有指定动画的名称，或者动画名称为 null，则没必要做动画了

    if (items && items.length && !rest.children) (rest as any).children = items[key as number]

    return <TransitionGroup {...groupProps}>
      <TransitionGroupItem key={key} {...rest} />
    </TransitionGroup>
  }
}
