import * as React from 'react'
import Transition from './Transition'
import {removeComponent, renderComponent as rc, getDefaultContainer} from './Render'

import './style/Modal.scss'

export interface IModalProps {
  itemKey?: string | number
  className?: string
  animate?: string
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  height?: string | number
  minHeight?: string | number
  maxHeight?: string | number
  closeModal?: () => void
  children?: React.ReactNode
}

export default class Modal extends React.PureComponent<IModalProps, any> {
  static defaultProps = {
    animate: 'zoomIn',
    minWidth: 200,
    maxWidth: '90%',
    minHeight: 100,
    maxHeight: '90%'
  }

  static dialog(props: IModalProps, component): {destroy: () => void} {
    let container = getDefaultContainer()
    let closeModal = () => removeComponent(container)
    props.closeModal = closeModal
    props.children = React.cloneElement(component)
    renderComponent(props, container)
    return {destroy: closeModal}
  }

  container = null

  renderComponent() {
    if (!this.container) this.container = getDefaultContainer()
    renderComponent(this.props, this.container, this)
  }
  removeComponent() {
    removeComponent(this.container)
  }
  componentDidMount() {
    this.renderComponent()
  }

  componentDidUpdate() {
    this.renderComponent()
  }

  componentWillUnmount() {
    this.removeComponent()
  }

  render() {
    return null
  }
}

function renderComponent(props, container?: Element, context?: React.Component<any, any>) {
  let {
    className = '', closeModal, children, animate, itemKey,
    width, height, minWidth, maxWidth, minHeight, maxHeight
  } = props

  let style = {width, minWidth, maxWidth, height, minHeight, maxHeight}

  let el = (
    <div className={'wModal ' + className} role='dialog'>
      <div className='modalMask' onClick={closeModal} />
      <Transition itemKey={itemKey} name={animate} leave={false} appear={true} className='modalTransition' style={{pointerEvents: 'none'}}>
        <div className='modalWrap gHVCenterChildren'>
          <div style={style} className='modalContent'>
            {children}
          </div>
        </div>
      </Transition>
    </div>
  )

  return rc(el, container, context)
}
