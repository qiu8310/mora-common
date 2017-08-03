// 参考 https://reacttraining.com/react-router/web/guides/code-splitting
import * as React from 'react'

export interface IBundleProps {
  load: (callback: (mod: any) => void) => void
  children: (mod: any) => false | React.ReactElement<any>
}

export default class Bundle extends React.PureComponent<IBundleProps, any> {
  state = {mod: null}

  componentWillMount() {
    this.load(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps)
    }
  }

  load(props) {
    if (this.state.mod !== null) this.setState({mod: null})
    props.load((mod) => {
      // handle both es imports and cjs
      this.setState({mod: mod.default ? mod.default : mod})
    })
  }

  render() {
    return this.props.children(this.state.mod)
  }
}
