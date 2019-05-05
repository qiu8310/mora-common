import {between} from '../../util/math'
import {throttle} from '../../util/time'

import './responsive.declare'

export namespace responsive {
  export interface Options {
    /** 全屏幕时的 rem 的大小 */
    screenRemSize?: number
    /**
     * 屏幕上显示的最小的文档宽度
     */
    minWidth?: number
    /**
     * 屏幕上显示的最大的文档宽度
     */
    maxWidth?: number
    /**
     * 设计稿的宽度
     *
     * 指定此宽度，这样在开发时你就可以直接使用设计稿上测量出的宽度
     */
    designWidth?: number
  }
}

/**
 * 自动根据手机屏幕宽度的变化，设置 root element 的字体的大小
 */
export function responsive(options: responsive.Options = {}) {
  let {screenRemSize = 10, minWidth = 320, designWidth = 375, maxWidth = 540} = options
  //
  //  注意： 直接下面的 meta 就不用 rem 单位了，但有表单时会导致屏幕放大
  //    <meta name="viewport" content="width=375">
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
  let docEl = document.documentElement as HTMLElement

  function refresh() {
    let rootFontSize = between(docEl.clientWidth, MIN_WIDTH, MAX_WIDTH) / SCREEN_REM_SIZE
    docEl.style.fontSize = rootFontSize + 'px'
  }

  function px2rem(px: number) {
    return px / baseRootFontSize
  }

  function rem2px(rem: number) {
    return rem * baseRootFontSize
  }

  function p2r(px: number | string): string {
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

  // @ts-ignore
  window.p2r = p2r
  let t = window.p2r

  t.meta = {dpr, hairlines}
  t.px2rem = px2rem
  t.rem2px = rem2px
  t.responsive = refresh
}
