import * as React from 'react'
import classSet from '../util/classSet'

export interface IHTMLPRops extends React.HTMLAttributes<HTMLSpanElement> {
  /** 多行的话只显示指定的行数（注意，需要引入一个 lineClamp 类，可以在 style/base/common 中找到 ） */
  lineClamp?: number
  /** 是否 html 内容来自于 CKEditor 组件生成的，是的话会给当前 html 组件加上一个 ck 的 className */
  fromEditor?: boolean
  value?: string
  children?: string
  /** 简单模式，只处理 换行 和 空格 */
  simple?: boolean
}

const REG_LINE = /\r?\n/
const REG_SPACES = / +| {2,}/g // 行首有一个空格，或者行中有多个空格

export default class HTML extends React.PureComponent<IHTMLPRops, any> {
  render() {
    let {className = '', style = {}, simple, children, value, lineClamp, fromEditor, ...rest} = this.props
    className = classSet('wHTML', className, {gLineClamp: lineClamp, ck: fromEditor})
    let html = (children != null ? children : value) || ''
    if (lineClamp) {
      style.lineClamp = lineClamp
      style.WebkitLineClamp = lineClamp
    }
    if (simple) {
      let elements = []
      html.split(REG_LINE).forEach((text, i) => {
        elements.push(...insertSpaces(text), <br />)
      })
      elements.pop() // 去掉最后一个换行
      return <span style={style} className={className} {...rest} children={elements} />
    } else {
      return <span style={style} className={className} dangerouslySetInnerHTML={{__html: html}} {...rest} />
    }
  }
}

function insertSpaces(text: string) {
  let elements = []
  let index = 0
  text.replace(REG_SPACES, (spaces, i) => {
    if (index < i) elements.push(text.substring(index, i))
    elements.push(<span dangerouslySetInnerHTML={{__html: createHtmlSpaces(spaces.length)}} />)
    index = i + spaces.length
    return ''
  })
  if (index < text.length) elements.push(text.substr(index))
  return elements
}

function createHtmlSpaces(size) {
  let arr = []
  for (let i = 0; i < size; i++) {
    arr.push('&nbsp')
  }
  return arr.join('')
}
