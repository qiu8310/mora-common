import * as React from 'react'

export default class Component<P> extends React.Component<P, any> {
  state = {loading: false}

  get loading() { return this.state.loading }
  doLoading(data: any = {}, cb?: () => void) { this.setState({...data, loading: true}, cb) }
  doneLoading(data: any = {}, cb?: () => void) { this.setState({...data, loading: false}, cb) }
}
