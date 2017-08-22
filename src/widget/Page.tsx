import * as React from 'react'
import {default as classSet, IClassSetArg} from '../util/classSet'
import {BodyClassName, DocumentTitle} from './SideEffect'

export interface IPageProps extends React.HTMLProps<HTMLDivElement> {
  name: string
  title?: string
  className?: IClassSetArg
}

export default class Page extends React.PureComponent<IPageProps, any> {
  render() {
    let {name, title, className, children, ...props} = this.props as any

    let ucName = name[0].toUpperCase() + name.slice(1)
    props.className = classSet('page p' + ucName, className)

    let el = <BodyClassName className={'body' + ucName}><div {...props}>{children}</div></BodyClassName>

    return title
      ? <DocumentTitle title={title} children={el} />
      : el
  }
}
