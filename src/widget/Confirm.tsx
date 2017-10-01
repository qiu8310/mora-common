import * as React from 'react'
import {renderComponent, removeComponent, getDefaultContainer} from './Render'
import {Transition} from './Transition'
import {autobind} from '../util/autobind'

import './style/Confirm.scss'

const emptyFn = () => {}

export interface IConfirmProps {
  title: string
  okText?: string
  cancelText?: string

  onOk?: () => void
  onCancel?: () => void
  onClose?: () => void
}

export function confirm(props: IConfirmProps, instance?: JSX.ElementClass) {
  let oldOnClose = props.onClose
  let container = getDefaultContainer()
  props.onClose = () => {
    // 同步 remove 会导致 react 报不能调用 setState 的错误（应该是 React 的一个 Bug）
    setTimeout(() => {
      removeComponent(container)
      if (oldOnClose) oldOnClose()
    }, 0)
  }
  renderComponent(<Confirm {...props} />, container, instance)
}

export class Confirm extends React.PureComponent<IConfirmProps, any> {
  static defaultProps = {
    okText: '确认',
    cancelText: '取消',
    onOk: emptyFn,
    onCancel: emptyFn,
    onClose: emptyFn,
  }

  closeFnKey: string
  state = {
    itemIndex: 0
  }

  // Transition 下的两个组件
  items = [
    null,

    <div>
      <label className='row title'>{this.props.title}</label>
      <a onClick={this.onOk} className='row btn ok'>{this.props.okText}</a>
      <a onClick={this.onCancel} className='row btn cancel'>{this.props.cancelText}</a>
    </div>
  ]

  componentDidMount() {
    this.setState({itemIndex: 1})
  }

  @autobind onOk() {
    this.close('onOk')
  }
  @autobind onCancel() {
    this.close('onCancel')
  }

  render() {
    let {itemIndex} = this.state

    return (
      <div className='wConfirm'>
        <div className={itemIndex ? 'mask' : ''} />
        <Transition afterLeave={this.afterClose} name='slideUp' className='content' items={this.items} itemKey={itemIndex} />
      </div>
    )
  }

  private close(fnKey: string) {
    this.closeFnKey = fnKey
    this.setState({itemIndex: 0})
  }

  @autobind private afterClose() {
    if (this.closeFnKey) {
      this.props.onClose()
      this.props[this.closeFnKey]()
      this.closeFnKey = null
    }
  }
}
