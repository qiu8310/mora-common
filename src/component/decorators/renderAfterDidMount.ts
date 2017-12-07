import * as React from 'react'

/**
 * 有些组件需要取到父组件的 dom
 *
 * 这时就需要等到自己完全加载完（即父组件也加载完，不考虑父组件中有异步的情况）
 */
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
