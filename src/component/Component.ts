import * as React from 'react'

export default class Component<P, S> extends React.Component<P, S> {
  constructor(props, context) {
    super(props, context)
    this.state = {} as any
  }
}

