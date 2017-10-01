/* tslint:disable:member-ordering */
// 可以参考  https://github.com/tajo/react-portal 项目
import * as React from 'react'
import {removeComponent, renderComponent, getDefaultContainer} from '../widget/Render'
import {ModalDOM, IModalDOMPropsWithoutEvents} from './ModalDOM'
import {once} from '../util/once'

export interface IModalDialogProps extends IModalDOMPropsWithoutEvents {
  /** 启用了 nowrap 之后 children 不能是字符串，需要是 JSX.Element */
  nowrap?: boolean
  container?: Element
  closeOnPressESC?: boolean
  closeOnClickMask?: boolean
  closeOnClickOutside?: boolean // 无 mask 或 maskClickThrough 时候的时候此字段有用
}

export interface IModalDialogResult {
  destroy: () => void
}

export interface IModalProps extends IModalDialogProps {
  /** 如果使用了 closeOnPressESC， closeOnClickMask 或 closeOnClickOutside，就需要设置此属性 */
  closeModal?: () => void
}

const emptyFn = () => {}

/*
  需要这样使用

  this.state.isModalVisiable
    ? <Modal closeOnClickMask closeModal={() => this.setState({isModalVisiable: false})}>...</Modal>
    : null

 */
export class Modal extends React.PureComponent<IModalProps, any> {
  static dialog(props: IModalDialogProps, component: JSX.Element, instance?: JSX.ElementClass): IModalDialogResult {
    let container = props.container || getDefaultContainer()
    let closeModal = () => removeComponent(container)
    rc({...props, closeModal, children: React.cloneElement(component)}, container, instance)
    return {destroy: once(closeModal)}
  }

  static render(context: React.Component<any, any>, stateKey: string, Component: React.ComponentClass<any>, props: React.Props<Modal> & IModalDialogProps = {}, compProps = {}) {
    let closeModal = () => context.setState({[stateKey]: false})
    return context.state[stateKey]
      ? <Modal {...props} closeModal={closeModal}>
          <Component data={context.state[stateKey]} {...compProps} closeModal={closeModal} />
        </Modal>
      : null
  }

  static defaultProps = {
    closeModal: emptyFn
  }

  container = this.props.container || getDefaultContainer()

  renderModal() {
    rc(this.props, this.container, this)
  }

  componentDidMount() {
    this.renderModal()
  }

  componentDidUpdate() {
    this.renderModal()
  }

  componentWillUnmount() {
    removeComponent(this.container)
  }

  render() {
    return null
  }
}

function rc(props: IModalProps, container, instance) {
  const {
    closeOnPressESC, closeOnClickMask, closeOnClickOutside, closeModal, nowrap,
    /* 这个 container 已经无用了 */ container: _, ...rest
  } = props

  let child
  if (nowrap) {
    child = props.children
    if (!child.type) child = <div>{child}</div> // ReactNode 还包括 string 和 boolean
  }

  renderComponent(
    nowrap
      ? child
      : (
        <ModalDOM {...rest}
          onPressESC={closeOnPressESC ? closeModal : emptyFn}
          onClickMask={closeOnClickMask ? closeModal : emptyFn}
          onClickOutside={closeOnClickOutside ? closeModal : emptyFn}
        />
      )
    ,
    container,
    instance
  )
}
