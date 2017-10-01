import * as React from 'react'
import {matchPath} from 'react-router'
import {Route, RouteProps, RouteComponentProps} from 'react-router-dom'
import {Transition} from './Transition'

import './style/TransitionRoute.scss'

export interface ITransitionRouteProps extends React.HTMLAttributes<HTMLDivElement> {
  items: RouteProps[]
}

// 不能继承 PureComponent， 否则 Route 不会更新
export class TransitionRoute extends React.Component<ITransitionRouteProps, any> {
  /*
    根据 Switch 组件改编
    本来应该这样写： <Switch location={routeProps.location} children={this.props.items.map((item, i) => <Route key={i} {...item} />)} />
  */
  getRoute(routeProps: RouteComponentProps<any>) {
    let {items} = this.props

    let {location: {pathname}} = routeProps
    let match
    let matchedItem: RouteProps

    items.some(item => {
      match = matchPath(pathname, item)
      matchedItem = item
      return !!match
    })

    return match
      ? {key: match.url, route: <Route {...matchedItem} /> }
      : {key: '', route: null}
  }

  render() {
    let {items, ...props} = this.props
    return (
      <Route render={routeProps => {
        let {key, route} = this.getRoute(routeProps)
        return <Transition
          className='wTransitionRoute'
          groupProps={{component: 'span'}}
          itemKey={key}
          componentProps={props}
          name='route'
          leave={false}
          enter
          children={route}
        />
      }}/>
    )
  }
}

