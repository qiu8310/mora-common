// 改编自 https://github.com/yiminghe/dom-scroll-into-view

import {getScrollerContainer} from './dom'
import {Scroller} from './Scroller'

export namespace scrollIntoView {
  export interface Option {
    allowHorizontalScroll?: boolean
    offsetTop?: number
    offsetLeft?: number
  }
}

/**
 * 将元素移到指定位置
 *
 * @param el 需要移动的元素
 * @param option 配置项
 *
 */
export function scrollIntoView(el: HTMLElement, option: scrollIntoView.Option = {}) {
  let {offsetTop = 5, offsetLeft = 5, ...rest} = option

  let rect = el.getBoundingClientRect()
  if (!rect.width && !rect.height) return // 没有宽高，说明没有显示，则不需要滚动

  let container = getScrollerContainer(el, option.allowHorizontalScroll ? 'both' : 'vertical')
  if (!container) return
  let scroller = new Scroller(container)
  let c = container.getBoundingClientRect()

  let y = rect.top - c.top - offsetTop   // 需要向上改变的位移
  scroller.top = y > 0 ? y : scroller.top + y // 上下移动

  if (option.allowHorizontalScroll) {
    let x = rect.left - c.left - offsetLeft // 需要向左改变的位移
    scroller.left = x > 0 ? x : scroller.left + x // 左右移动
  }

  // 其它容器就不需要 offset 了
  scrollIntoView(container, {...rest, offsetTop: 0, offsetLeft: 0})
}
