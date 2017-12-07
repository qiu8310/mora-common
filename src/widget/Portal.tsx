// 根据  https://github.com/tajo/react-portal 项目改编
// react 16 自带 ReactDOM.renderPortal 方法了
// 此项目逻辑比较复杂，建议使用 Modal 项目

import * as React from 'react'
import {getDefaultContainer, renderComponent, removeComponent} from '../widget/Render'
import {KeyboardEvents} from '../component/implements/KeyboardEvents'
import {OutsideClickable} from '../component/implements/OutsideClickable'
import {autobind} from '../util/autobind'
import {ModalDOM, IModalDOMProps} from './ModalDOM'

export interface IPortalProps {
  children: JSX.Element
  closeOnPressESC?: boolean
  closeOnClickMask?: boolean
  closeOnClickOutside?: boolean // 无 mask 或 maskClickThrough 时候的时候此字段有用

  isOpen?: boolean
  trigger?: JSX.Element

  modal?: boolean | IModalDOMProps

  onOpen?: (container: Element) => void
  onClose?: () => void
  beforeClose?: (container: Element, callback: () => void) => void
  onUpdate?: () => void
}

/*
  // 通过 isOpen 控制 显示/隐藏
  <button onClick={this.setState({openPortal: true})}>Open</button>
  <Portal isOpen={this.state.openPortal}>
    <div>...</div>
  </Portal>

  // 通过子组件自己控制 显示/隐藏
  <Portal triggle={<button>Open</button>}>
    <Child />
  </Portal>

  function Child(props) {
    return <button onClick={props.closePortal}>close</button>
  }
 */
@KeyboardEvents.apply()
@OutsideClickable.apply({sensitive: true})
export class Portal extends React.PureComponent<IPortalProps, any> implements KeyboardEvents, OutsideClickable {
  static defaultProps = {
    onOpen: () => {},
    onClose: () => {},
    beforeClose: (e: Element, c: () => void) => c(),
    onUpdate: () => {}
  }

  container: Element | null
  state = {
    active: false
  }

  keyboard = {
    esc: () => { if (this.state.active && this.props.closeOnPressESC) this.close() }
  }

  @autobind open(props = this.props) {
    this.setState({active: true})
    this.renderPortal(props, true)
  }
  @autobind close(isUnmounted = false) {
    if (!this.state.active) return

    let {props} = this as any

    props.beforeClose(this.container, () => {
      if (this.container) removeComponent(this.container)
      this.container = null
      if (isUnmounted !== true) this.setState({active: false})
      props.onClose()
    })
  }

  getInsideContainer() {
    if (!this.state.active || !this.props.closeOnClickOutside) return
    return this.container
  }
  onClickOutside() {
    if (this.state.active) this.close()
  }

  renderPortal(props: IPortalProps, isOpening = false) {
    let {children, onOpen, onUpdate, modal, closeOnClickMask} = props
    let {container} = this
    if (!container) this.container = container = getDefaultContainer()
    if (isOpening && onOpen) onOpen(container)

    if (typeof children.type === 'function') {
      children = React.cloneElement(children, {
        closePortal: this.close
      })
    }

    if (modal) {
      let modalProps = modal === true ? {} : modal
      let close: any = this.close
      children = <ModalDOM {...modalProps}
        children={children}
        onClickMask={closeOnClickMask ? close : null}
      />
    }
    renderComponent(children, container, this, onUpdate)
  }

  componentWillReceiveProps(newProps: IPortalProps) {
    let {active} = this.state
    let {isOpen} = newProps
    if (isOpen != null) {
      if (isOpen) {
        if (active) {
          this.renderPortal(newProps)
        } else {
          this.open(newProps)
        }
      } else if (active) {
        this.close()
      }
    } else if (active) {
      this.renderPortal(newProps)
    }
  }

  componentWillUnmount() {
    this.close(true)
  }

  render() {
    if (this.props.trigger) {
      return React.cloneElement(this.props.trigger, {
        onClick: this.handleWrapperClick
      })
    }
    return null
  }

  @autobind private handleWrapperClick(e: React.MouseEvent<any>) {
    e.preventDefault()
    e.stopPropagation()
    if (!this.state.active) {
      this.open()
    }
  }
}
