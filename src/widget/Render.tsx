import * as React from 'react'
import * as ReactDOM from 'react-dom'

export interface IRender {
  className?: string
  container?: HTMLElement
  children?: JSX.Element
}

export default class extends React.PureComponent<IRender, any> {
  private container: HTMLElement = this.props.container || getDefaultContainer(this.props.className)

  renderComponent() {
    ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.container)
  }

  removeComponent() {
    ReactDOM.unmountComponentAtNode(this.container)
    this.container.parentNode.removeChild(this.container)
  }

  componentDidMount() {
    this.renderComponent()
  }

  componentDidUpdate(prevProps, prevState) {
    this.renderComponent()
  }

  componentWillUnmount() {
    this.removeComponent()
  }

  render() {
    return null
  }
}

function getDefaultContainer(className?: string) {
  let container = document.createElement('div')
  if (className) container.className = className
  document.body.appendChild(container)
  return container
}
