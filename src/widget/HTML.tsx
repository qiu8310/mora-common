import * as React from 'react'
import classSet from '../util/classSet'

export interface IHTMLPRops extends React.HTMLAttributes<HTMLSpanElement> {
  /** 多行的话只显示指定的行数（注意，需要引入一个 lineClamp 类，可以在 style/base/common 中找到 ） */
  lineClamp?: number
  /** 是否 html 内容来自于 CKEditor 组件生成的，是的话会给当前 html 组件加上一个 ck 的 className */
  fromEditor?: boolean
  value?: string
  children?: string
}

export default class HTML extends React.PureComponent<IHTMLPRops, any> {
  render() {
    let {className = '', style = {}, children, value, lineClamp, fromEditor, ...rest} = this.props
    className = classSet('wHTML', className, {lineClamp, ck: fromEditor})
    let html = children != null ? children : value
    if (lineClamp) {
      style.lineClamp = lineClamp
      style.WebkitLineClamp = lineClamp
    }
    return <div style={style} className={className} dangerouslySetInnerHTML={{__html: html || ''}} {...rest} />
  }
}
