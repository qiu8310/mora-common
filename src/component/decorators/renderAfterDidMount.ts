import * as React from 'react'

export function renderAfterDidMount(options?: any) {
  return (Component: React.ComponentClass) => {
    return class extends React.Component<any, any> {
      state = {
        mounted: false
      }
      componentDidMount() {
        this.setState({mounted: true})
      }
      render() {
        return this.state.mounted ? React.createElement(Component, this.props) : null
      }
    }
  }
}
