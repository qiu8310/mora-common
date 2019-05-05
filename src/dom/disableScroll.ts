import {bind} from './bind'
import {getRootElement} from './dom'

export function disableScroll(root?: Element) {
  let x: number = 0
  let y: number = 0
  let offs: Array<() => void> = []
  let preventDefault = (e: Event) => e.preventDefault()

  if (root) {
    offs.push(bind(root, 'touchstart', e => {
      x = e.touches[0].clientX
      y = e.touches[0].clientY
    }))

    offs.push(bind(root, 'touchmove', e => {
      let {clientX, clientY} = e.touches[0]
      if (Math.abs(x - clientX) >= 5 || Math.abs(y - clientY) >= 5) e.preventDefault()
    }))
  }

  // 如果在 window 系统上加上 overflow:hidden
  // 并且页面正好也有滚动条，那么加了 overflow 后，滚动条消失，页面会变宽，从而导致页面左右抖动
  // 所以 window 上不能通过设置 overflow:hidden 来禁止滚动

  // 但这样也有一个不好的地方，就是会禁用所有的滚动条，包括弹窗里的
  if (navigator.platform.toLowerCase().startsWith('win')) {
    offs.push(
      bind(window, 'wheel', preventDefault),
      // @ts-ignore
      bind(window, 'mousewheel', preventDefault),
      bind(document, 'keydown', e => {
        if ([37, 38, 39, 40].includes(e.keyCode)) preventDefault(e)
      })
    )
  } else {
    let scrollers = [getRootElement(), document.body]

    let doms: Array<{el: HTMLElement, overflow: string | null}> = []
    scrollers.forEach((el, i) => {
      if (el.scrollHeight > el.clientHeight) {
        doms.push({el, overflow: el.style.overflow})
        el.style.overflow = 'hidden'
      }
    })
    offs.push(() => {
      doms.forEach(({el, overflow}) => el.style.overflow = overflow)
    })
  }

  return () => offs.forEach(fn => fn())
}
