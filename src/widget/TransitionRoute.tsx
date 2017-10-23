import * as React from 'react'
import {Route, RouteProps, RouteComponentProps} from 'react-router-dom'
import {matchPath} from 'react-router'
import {Transition} from '../widget/Transition'
import {assignStyle} from '../dom/style'

export interface ITransitionRouteProps extends React.HTMLAttributes<HTMLDivElement> {
  items: RouteProps[]
  animation?: string
  animationDuration?: string
}

// 不能继承 PureComponent， 否则 Route 不会更新
export class TransitionRoute extends React.Component<ITransitionRouteProps, any> {
  static defaultProps = {
    animation: 'fadeIn',
    animationDuration: '0.4s'
  }
  /*
    根据 Switch 组件改编
    本来应该这样写： <Switch location={routeProps.location} children={this.props.items.map((item, i) => <Route key={i} {...item} />)} />
  */
  getRoute(routeProps: RouteComponentProps<any>) {
    let {items} = this.props

    let {location: {pathname, search}} = routeProps
    let match
    let matchedItem: RouteProps

    items.some(item => {
      match = matchPath(pathname, item)
      matchedItem = item
      return !!match
    })

    return match
      ? {key: match.url + search, route: <Route {...matchedItem} /> }
      : {key: '', route: null}
  }

  render() {
    let {items, animation: animationName, animationDuration, ...props} = this.props
    return (
      <Route render={routeProps => {
        let {key, route} = this.getRoute(routeProps)
        return <Transition
          className='wTransitionRoute gInEffect'
          groupProps={{component: 'span'}}
          itemKey={key}
          componentProps={props}
          name='route'
          leave={false}
          beforeEnter={el => assignStyle(el, {animationName, animationDuration})}
          enter
          children={route}
        />
      }}/>
    )
  }
}

