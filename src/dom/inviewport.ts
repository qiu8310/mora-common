import winViewport from './viewport'

export interface IViewport {
  top: number
  left: number
  right: number
  bottom: number
}

export interface IInviewOptions {
  viewport?: IViewport
  container?: Element
  offset?: number
}

function contains(viewport: IViewport, rect: IViewport) {
  return rect.right >= viewport.left &&
    rect.bottom >= viewport.top &&
    rect.left <= viewport.right &&
    rect.top <= viewport.bottom
}

function getDefaultViewport() {
  // winViewport 会变化，所以需要写在函数中，每次返回一个新对象
  return {
    top: 0,
    left: 0,
    right: winViewport.width,
    bottom: winViewport.height
  }
}

function expendOffset(viewport: IViewport, offset): IViewport {
  if (!offset) return viewport
  return {
    top: viewport.top - offset,
    left: viewport.left - offset,
    right: viewport.right + offset,
    bottom: viewport.bottom + offset
  }
}

export default function(el: Element, options: IInviewOptions): boolean {
  let rect = el.getBoundingClientRect()

  let {container, offset = 0, viewport = getDefaultViewport()} = options
  viewport = expendOffset(viewport, offset)

  if (container) {
    let containerRect = container.getBoundingClientRect()
    if (contains(viewport, containerRect)) {
      let {top, right, bottom, left} = expendOffset(containerRect, offset)
      let containerViewport = {
        top: top > viewport.top ? top : viewport.top,
        left: left > viewport.left ? left : viewport.left,
        right: right < viewport.right ? right : viewport.right,
        bottom: bottom < viewport.bottom ? bottom : viewport.bottom
      }
      return contains(containerViewport, rect)
    } else {
      return false
    }
  } else {
    return contains(viewport, rect)
  }
}
