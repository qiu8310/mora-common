import {onview} from './onview'
import {once} from '../util/once'
import {getWindowViewport} from './dom'

export namespace viewport {
  export interface ListenOptions {
    throttle?: number
    debounce?: number
    /** 包括监听 scroll 事件的 container, 和 el 元素的窗器，这两者一般是同一个 */
    container?: Element
    offset?: Offset
    enableIntersectionObserver?: boolean
  }

  export interface VisiableOptions {
    viewport?: Viewport
    container?: Element
    offset?: Offset
  }

  export interface Viewport {
    top: number
    left: number
    right: number
    bottom: number
  }

  export declare type Offset = number | Viewport
}

export const viewport = (() => {
  let res = {
    /** 当前视口的宽度 */
    width: 0,
    /** 当前视口的高度 */
    height: 0,

    /** 监听 element 能否在当前窗口下可见 */
    listen(element: Element, callback: (e: IntersectionObserverEntry[] | Event | {type: string}) => void, options: viewport.ListenOptions = {}): () => void {
      let {enableIntersectionObserver, container, offset = 0, debounce = 0, throttle = 200} = options

      // 默认不开始（对于那种频繁显示隐藏的元素时，没有 scroll 稳定）
      if (enableIntersectionObserver && typeof IntersectionObserver !== 'undefined') {
        // https://developers.google.com/web/updates/2016/04/intersectionobserver
        let io = new IntersectionObserver(
          entries => entries[0].intersectionRatio > 0 && callback(entries),
          {root: container, rootMargin: offset + 'px'}
        )
        io.observe(element)

        // onview 一定会在 domReady 后执行，所以 IntersectionObserver 也需要做下初始化判断
        if (viewport.visiable(element, {container, offset})) callback({type: 'init'})

        return once(() => {
          io.disconnect()
        })
      } else {
        // onview 已经包装了 once
        return onview((e) => {
          if (viewport.visiable(element, {container, offset})) callback(e)
        }, {throttle, debounce, container})
      }
    },

    /**
     * 判断元素 element 是否是在指定的 viewport 内，
     * 如果没指定 viewport，默认使用当前屏幕的宽高所在的 viewport
     */
    visiable(element: Element, options: viewport.VisiableOptions = {}): boolean {
      let rect = element.getBoundingClientRect()

      let {container, offset, viewport: winViewport} = options
      winViewport = expendViewport(winViewport || getDefaultViewport(), offset)

      if (container) {
        let containerRect = container.getBoundingClientRect()
        if (contains(winViewport, containerRect)) {
          let {top, right, bottom, left} = expendViewport(containerRect, offset)
          let containerViewport = {
            top: top > winViewport.top ? top : winViewport.top,
            left: left > winViewport.left ? left : winViewport.left,
            right: right < winViewport.right ? right : winViewport.right,
            bottom: bottom < winViewport.bottom ? bottom : winViewport.bottom
          }
          return contains(containerViewport, rect)
        } else {
          return false
        }
      } else {
        return contains(winViewport, rect)
      }
    },

    /**
     * 更新 viewport.width 和 viewport.height 中的值
     */
    refresh: setViewport,
  }

  // 实时更新 viewport 的宽高
  function setViewport() {
    let {width, height} = getWindowViewport()
    res.width = width
    res.height = height
  }

  setViewport()
  window.addEventListener('resize', setViewport)

  return res

})()

function contains(parent: viewport.Viewport, child: viewport.Viewport): boolean {
  return child.right >= parent.left &&
    child.bottom >= parent.top &&
    child.left <= parent.right &&
    child.top <= parent.bottom
}

function getDefaultViewport(): viewport.Viewport {
  // viewport 会变化，所以需要写在函数中，每次返回一个新对象
  return {
    top: 0,
    left: 0,
    right: viewport.width,
    bottom: viewport.height
  }
}

function expendViewport(rect: viewport.Viewport, offset?: viewport.Offset): viewport.Viewport {
  if (!offset) return rect
  let offsetRect = typeof offset === 'number' ? {left: offset, top: offset, bottom: offset, right: offset} : offset
  let {top = 0, left = 0, right = 0, bottom = 0} = offsetRect
  return {
    top: rect.top - top,
    left: rect.left - left,
    right: rect.right + right,
    bottom: rect.bottom + bottom
  }
}
