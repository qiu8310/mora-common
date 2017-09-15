import '../polyfill/responsive.declare'
import * as assign from 'mora-scripts/libs/lang/assign'

export interface IResponsiveOptions {
  screenRemSize?: number
  minWidth?: number
  maxWidth?: number
  designWidth?: number
}

export default function(options: IResponsiveOptions = {}) {
  let {screenRemSize = 10, minWidth = 320, designWidth = 375, maxWidth = 540} = options
  //
  //  注意： 直接下面的 meta 就不用 rem 单位了，但有表单时会导致屏幕放大
  //    <meta name="viewport" content="width=320">
  //

  // SCREEN_REM_SIZE 为 10 表示 10rem 为当前屏幕的宽度
  // 注意：保证 SCREEN_REM_SIZE * 12 < MIN_WIDTH, Chrome 下最小字体是 12px
  let SCREEN_REM_SIZE = screenRemSize
  let MIN_WIDTH = minWidth
  let MAX_WIDTH = maxWidth

  if (SCREEN_REM_SIZE * 12 > MIN_WIDTH) console.warn(`root 字体在 ${MIN_WIDTH} 下会小于 12px`)

  let tid
  let docWidth
  let rootFontSize
  let baseRootFontSize = designWidth / screenRemSize
  let docEl = document.documentElement

  function refresh() {
    docWidth = docEl.getBoundingClientRect().width
    rootFontSize = between(docWidth, MIN_WIDTH, MAX_WIDTH) / SCREEN_REM_SIZE
    docEl.style.fontSize = rootFontSize + 'px'
  }

  function px2rem(px) {
    // px / docWidth = rem / SCREEN_REM_SIZE
    return px / baseRootFontSize
    // return px * SCREEN_REM_SIZE / docWidth
  }

  function rem2px(rem) {
    return rem * baseRootFontSize
  }

  function p2r(px) {
    if (typeof px === 'string') {
      return px.replace(/([\.\d]+)px/g, (_, num) => {
        if (num.indexOf('.') >= 0) return p2r(parseFloat(num))
        else return p2r(parseInt(num, 10))
      })
    } else {
      if (px === 0) return '0'
      return px2rem(px).toFixed(5) + 'rem'
    }
  }

  function between(size, minSize, maxSize) {
    return Math.max(minSize, Math.min(maxSize, size))
  }

  function throttleRefresh() {
    clearTimeout(tid)
    tid = setTimeout(refresh, 300)
  }
  window.addEventListener('resize', throttleRefresh, false)
  window.addEventListener('pageshow', function(e) { if (e.persisted) throttleRefresh() }, false)
  refresh()
  document.addEventListener('DOMContentLoaded', refresh, false)

  assign(window, {px2rem, p2r, rem2px, responsive: refresh})
  // return {px2rem, rem2px, refresh}
}
