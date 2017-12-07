// 参考 https://reacttraining.com/react-router/web/guides/code-splitting
import * as React from 'react'

export interface IBundleProps {
  loading?: JSX.Element
  modKey?: string
  load: (callback: (mod: any) => void) => void
  children: (mod: any) => false | React.ReactElement<any>
}

export class Bundle extends React.PureComponent<IBundleProps, any> {
  state = {mod: null}

  componentWillMount() {
    this.load(this.props)
  }

  componentWillReceiveProps(nextProps: IBundleProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps)
    }
  }

  load(props: IBundleProps) {
    if (this.state.mod !== null) this.setState({mod: null})
    props.load((mod) => {
      // handle both es imports and cjs
      let modKey = props.modKey || 'default'
      this.setState({mod: mod[modKey] ? mod[modKey] : mod})
    })
  }

  render() {
    let {props: {children, loading}, state: {mod}} = this
    return mod ? children(mod) : (loading || null)
  }
}
