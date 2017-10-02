let transitionProp = 'transition'
let transitionEndEvent = 'transitionend'
let animationProp = 'animation'
let animationEndEvent = 'animationend'

let w: any = window
if (w.ontransitionend === undefined && w.onwebkittransitionend !== undefined) {
  transitionProp = 'WebkitTransition'
  transitionEndEvent = 'webkitTransitionEnd'
}
if (w.onanimationend === undefined && w.onwebkitanimationend !== undefined) {
  animationProp = 'WebkitAnimation'
  animationEndEvent = 'webkitAnimationEnd'
}

export {transitionProp, animationProp, transitionEndEvent, animationEndEvent}

export function assignStyle(el: HTMLElement, style: React.CSSProperties) {
  if (el && style) {
    Object.keys(style).forEach(k => {
      let assignKey = k
      if (transitionProp !== 'transition' && k.indexOf('transition') === 0) assignKey = transitionProp + k.slice(10)
      else if (animationProp !== 'animation' && k.indexOf('animation') === 0) assignKey = animationProp + k.slice(9)
      el.style[assignKey] = style[k]
    })
  }
}
