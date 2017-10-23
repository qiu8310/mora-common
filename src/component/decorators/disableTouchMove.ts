import * as React from 'react'

export function disableTouchMove(options?: any) {
  return (Component: React.ComponentClass) => {
    return class extends React.Component<any, any> {
      handle = (e: TouchEvent) => e.preventDefault()
      componentDidMount() {
        document.addEventListener('touchmove', this.handle)
      }
      componentWillUnmount() {
        document.removeEventListener('touchmove', this.handle)
      }
      render() {
        return React.createElement(Component, this.props)
      }
    } as any
  }
}
