import * as React from 'react'
import * as ReactDOM from 'react-dom'

export interface IRenderProps {
  className?: string
  container?: Element
  children: JSX.Element
}

export class Render extends React.PureComponent<IRenderProps, any> {
  private container: Element = this.props.container || getDefaultContainer(this.props.className)

  componentDidMount() {
    renderComponent(this.props.children, this.container, this)
  }

  componentDidUpdate() {
    renderComponent(this.props.children, this.container, this)
  }

  componentWillUnmount() {
    removeComponent(this.container)
  }

  render() {
    return null
  }
}

export function renderComponent(children: JSX.Element, container?: Element, instance?: JSX.ElementClass, callback?: () => void): void | Element | React.Component<any, any> {
  container = container || getDefaultContainer()

  // https://reactjsnews.com/modals-in-react
  // https://github.com/react-component/util/blob/master/src/getContainerRenderMixin.jsx
  if (instance) {
    // 不同点在于它关联了 instance 组件，跟随 instance 的消失而消失
    return ReactDOM.unstable_renderSubtreeIntoContainer(instance, children, container, callback)
  } else {
    return ReactDOM.render(children, container, callback)
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
