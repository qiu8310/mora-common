import * as withSideEffect from 'react-side-effect'
import * as React from 'react'

export default class SideEffect<P, S> extends React.PureComponent<P, S> {
  render() {
    let {children} = this.props
    return children ? React.Children.only(children) : null
  }
}

@withSideEffect(makeReducePropsToState('className'), className => {
  let nextClassname = className || ''
  if (nextClassname !== document.body.className) document.body.className = nextClassname
})
export class BodyClassName extends SideEffect<{className: string}, any> {}

// react-document-title v2.0.3
@withSideEffect(makeReducePropsToState('title'), title => {
  let nextTitle = title || ''
  if (nextTitle !== document.title) document.title = nextTitle
})
export class DocumentTitle extends SideEffect<{title: string}, any> {}

function makeReducePropsToState(key) {
  return (propsList) => {
    let innermostProps = propsList[propsList.length - 1]
    if (innermostProps) {
      return innermostProps[key]
    }
  }
}
