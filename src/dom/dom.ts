/**
 * 获取当前文档的 html 根元素
 */
export function getRootElement() {
  return document.documentElement as HTMLElement
}

/**
 * 获取当前 Element 所在的 window 对象
 */
export function getWindow(el: Element) {
  return (el.ownerDocument as Document).defaultView as Window
}

/**
 * 获取当前文档的宽高
 */
export function getDocumentSize() {
  let w = window
  let d = document
  let h = getRootElement()
  let width = w.innerWidth || h.clientWidth
  let height = w.innerHeight || h.clientHeight
  return {
    width: Math.max(h.scrollWidth, d.body.scrollWidth, width),
    height: Math.max(h.scrollHeight, d.body.scrollHeight, height)
  }
}

/**
 * 获取当前浏览器的视窗大小
 */
export function getWindowViewport() {
  let w = window
  let h = getRootElement()
  return {
    width: w.innerWidth || h.clientWidth,
    height: w.innerHeight || h.clientHeight,
  }
}

/**
 * 获取指定元素父级可滚动的元素（不包含它本身）
 *
 * **包含横向和纵向可滚动的元素，可以通过指定第二个参数来获取指定方向**
 */
export function getScrollerContainer(el: HTMLElement, direction: 'vertical' | 'horizontal' | 'both' = 'both') {
  let container: HTMLElement | null = null

  while (!container && el.parentElement) {
    el = el.parentElement

    let vertical = el.scrollHeight > el.clientHeight
    let horizontal = el.scrollWidth > el.clientWidth

    if (direction === 'vertical' && vertical || direction === 'horizontal' && horizontal || direction === 'both' && (vertical || horizontal)) {
      container = el
    }
  }
  return container
}

/**
 * 获取指定元素的 offset (即元素在页面的绝对位置，滚动条不影响 offset)
 */
export function getElementOffset(el: HTMLElement) {
  let left = 0
  let top = 0
  let isSelf = true

  while (el.offsetParent) {
    let s = getWindow(el).getComputedStyle(el)

    // 不需要计算它自己的边框
    top += el.offsetTop + (isSelf ? 0 : parseStyle(s.borderTopWidth))
    left += el.offsetLeft + (isSelf ? 0 : parseStyle(s.borderLeftWidth))

    el = el.offsetParent as HTMLElement
    isSelf = false
  }

  return {left, top}
}

function parseStyle(style: string | null) {
  return style ? (parseFloat(style) || 0) : 0
}
