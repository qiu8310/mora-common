import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Transition from './Transition'

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
}

export default class Modal extends React.PureComponent<IModalProps, any> {
  static defaultProps = {
    animate: 'zoomIn',
    minWidth: 200,
    maxWidth: '90%',
    minHeight: 100,
    maxHeight: '90%'
  }

  static dialog = (props, component) => {
    let container = getDefaultContainer()
    let closeModal = () => removeComponent(container)
    props.closeModal = closeModal
    props.children = React.cloneElement(component, {closeModal})
    renderComponent(container, props)
    return {destroy: closeModal}
  }

  container = null

  renderComponent() {
    if (!this.container) this.container = getDefaultContainer()
    renderComponent(this.container, this.props, this)
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

function renderComponent(container, props, context?: any) {
  let {
    className = '', closeModal, children, animate, itemKey,
    width, height, minWidth, maxWidth, minHeight, maxHeight
  } = props

  let style = {width, minWidth, maxWidth, height, minHeight, maxHeight}

  let el = (
    <div className={'wModal ' + className} role='dialog'>
      <div className='modalMask' onClick={closeModal} />
      <Transition itemKey={itemKey} name={animate} leave={false} appear={true} className='modalTransition' style={{pointerEvents: 'none'}}>
        <div className='modalWrap hvCenterChildren'>
          <div style={style} className='modalContent'>
            {children}
          </div>
        </div>
      </Transition>
    </div>
  )

  // https://reactjsnews.com/modals-in-react
  // https://github.com/react-component/util/blob/master/src/getContainerRenderMixin.jsx
  if (context) ReactDOM.unstable_renderSubtreeIntoContainer(context, el, container)
  else ReactDOM.render(el, container)
}
function removeComponent(container) {
  if (container) {
    ReactDOM.unmountComponentAtNode(container)
    container.parentNode.removeChild(container)
  }
}
function getDefaultContainer() {
  let container = document.createElement('div')
  document.body.appendChild(container)
  return container
}
