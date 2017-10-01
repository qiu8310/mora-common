import '../polyfill/responsive.declare'
import * as assign from 'mora-scripts/libs/lang/assign'
import {throttle} from '../util/delay'

export interface IResponsiveOptions {
  screenRemSize?: number
  minWidth?: number
  maxWidth?: number
  designWidth?: number
}

export function responsive(options: IResponsiveOptions = {}) {
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
  let dpr = window.devicePixelRatio || 1
  let hairlines = false

  if (SCREEN_REM_SIZE * 12 > MIN_WIDTH) console.warn(`root 字体在 ${MIN_WIDTH} 下会小于 12px`)

  let baseRootFontSize = designWidth / screenRemSize
  let docEl = document.documentElement

  function refresh() {
    let rootFontSize = between(docEl.clientWidth, MIN_WIDTH, MAX_WIDTH) / SCREEN_REM_SIZE
    docEl.style.fontSize = rootFontSize + 'px'
  }

  function px2rem(px) {
    return px / baseRootFontSize
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

  // function throttleRefresh() {
  //   clearTimeout(tid)
  //   tid = setTimeout(refresh, 300)
  // }
  let throttleRefresh = throttle(refresh, 300)
  window.addEventListener('resize', throttleRefresh)
  window.addEventListener('pageshow', function(e) { if (e.persisted) throttleRefresh() })

  if (document.body) refresh()
  else document.addEventListener('DOMContentLoaded', refresh)

  // detect 0.5px supports
  if (dpr >= 2) {
    let fakeBody = document.createElement('body')
    let testElement = document.createElement('div')
    testElement.style.border = '.5px solid transparent'
    fakeBody.appendChild(testElement)
    docEl.appendChild(fakeBody)
    if (testElement.offsetHeight === 1) docEl.classList.add('hairlines')
    docEl.removeChild(fakeBody)
  }

  assign(window, {px2rem, p2r, rem2px, responsive: refresh, meta: {dpr, hairlines}})
  // return {px2rem, p2r, rem2px, responsive: refresh}
}
