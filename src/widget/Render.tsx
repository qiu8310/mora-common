import * as React from 'react'
import * as ReactDOM from 'react-dom'

export interface IRender {
  className?: string
  container?: Element
  children?: JSX.Element
}

export default class extends React.PureComponent<IRender, any> {
  private container: Element = this.props.container || getDefaultContainer(this.props.className)

  componentDidMount() {
    renderComponent(this.props.children, this.container, this)
  }

  componentDidUpdate(prevProps, prevState) {
    renderComponent(this.props.children, this.container, this)
  }

  componentWillUnmount() {
    removeComponent(this.container)
  }

  render() {
    return null
  }
}

export function renderComponent(children: JSX.Element, container?: Element, instance?: JSX.ElementClass): () => void {
  container = container || getDefaultContainer()

  // https://reactjsnews.com/modals-in-react
  // https://github.com/react-component/util/blob/master/src/getContainerRenderMixin.jsx
  if (instance) {
    // 不同点在于它关联了 instance 组件，跟随 instance 的消失而消失
    ReactDOM.unstable_renderSubtreeIntoContainer(instance, children, container)
  } else {
    ReactDOM.render(children, container)
  }
  return () => {
    removeComponent(container)
  }
}
export function removeComponent(container: Element): void {
  if (!container) return
  let result = ReactDOM.unmountComponentAtNode(container)
  if (result && container.parentNode) container.parentNode.removeChild(container)
}

export function getDefaultContainer(className?: string, parentNode?: Element): Element {
  let container = document.createElement('div')
  if (className) container.className = className

  parentNode = parentNode || document.body
  parentNode.appendChild(container)
  return container
}
