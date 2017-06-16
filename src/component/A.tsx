import deprecated from '../util/deprecated'
import * as React from 'react'

class A extends React.Component<any, any> {
  @deprecated('xxx')
  foo() {
    return this
  }

  componentWillUnmount() {
    this.state = null
  }

  render() {
    return <div>xxx</div>
  }
}

console.log(Object.getPrototypeOf(A.prototype))
