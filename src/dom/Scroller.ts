import {getRootElement} from './dom'

const html = getRootElement()

function scroll(element: Element, top: boolean, value?: number) {
  let method: 'scrollTop' | 'scrollLeft' = top ? 'scrollTop' : 'scrollLeft'
  let {body} = document

  if (value == null) {
    let rtn = element[method]
    // 某些移动端滚动使用的是 body，桌面端使用的是 html
    if (element === html && !rtn) rtn = body[method]
    else if (element === body && !rtn) rtn = html[method]
    return rtn || 0
  } else {
    element[method] = value
    // 某些移动端滚动使用的是 body，桌面端使用的是 html
    if (element === html) body[method] = value
    else if (element === body) html[method] = value
    return value
  }
}

export namespace Scroller {
  export interface Position {
    x: number
    y: number
  }
}

export class Scroller {
  private el: Element
  constructor(el?: Element | null/*, private container?: Element*/) {
    this.el = el || html
  }
  get lengthY() {
    let {el} = this
    let {body} = document
    let len = getYLength(el)
    if (len === 0 && (el === body || el === html)) {
      len = getYLength(el === body ? html : body)
    }
    return len
  }
  get lengthX() {
    let {el} = this
    let {body} = document
    let len = getXLength(el)
    if (len === 0 && (el === body || el === html)) {
      len = getYLength(el === body ? html : body)
    }
    return len
  }

  get top() {
    return scroll(this.el, true)
  }
  set top(value: number) {
    scroll(this.el, true, value)
  }
  get bottom() {
    return this.lengthY - this.top
  }
  set bottom(value: number) {
    this.top = this.lengthY - value
  }
  get left() {
    return scroll(this.el, false)
  }
  set left(value: number) {
    scroll(this.el, false, value)
  }
  get right() {
    return this.lengthX - this.left
  }
  set right(value: number) {
    this.left = this.lengthX - value
  }
}

function getYLength(el: Element) {
  return el.scrollHeight - el.clientHeight
}
function getXLength(el: Element) {
  return el.scrollWidth - el.clientWidth
}
