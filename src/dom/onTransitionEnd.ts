export declare type ANIM_TYPE = 'transition' | 'animation'
const TRANSITION: ANIM_TYPE = 'transition'
const ANIMATION: ANIM_TYPE = 'animation'

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

export default function onTransitionEnd(el: Element, callback: () => {}, expectAnimType?: ANIM_TYPE) {
  const {type, timeout, propCount} = getTransitionInfo(el, expectAnimType)
  if (!type) return callback()
  let event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    el.removeEventListener(event, onEnd)
    callback()
  }
  const onEnd = e => {
    if (e.target === el) {
      if (++ended >= propCount) end()
    }
  }

  setTimeout(() => {
    if (ended < propCount) end()
  }, timeout + 1)

  el.addEventListener(event, onEnd)
}

export {transitionProp, animationProp, transitionEndEvent, animationEndEvent, onTransitionEnd}

export function getTransitionInfo(el: Element, expectAnimType?: ANIM_TYPE) {
  const styles = window.getComputedStyle(el)
  const transitionDelays: string[] = styles[transitionProp + 'Delay'].split(', ')
  const transitionDurations: string[] = styles[transitionProp + 'Duration'].split(', ')
  const transitionTimeout: number = getTimeout(transitionDelays, transitionDurations)

  const animationDelays: string[] = styles[animationProp + 'Delay'].split(', ')
  const animationDurations: string[] = styles[animationProp + 'Duration'].split(', ')
  const animationTimeout: number = getTimeout(animationDelays, animationDurations)

  let type: ANIM_TYPE
  let timeout = 0
  let propCount = 0

  if (expectAnimType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = expectAnimType
      timeout = transitionTimeout
      propCount = transitionDurations.length
    }
  } else if (expectAnimType === ANIMATION) {
    if (animationTimeout > 0) {
      type = expectAnimType
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout)
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }
  return {type, timeout, propCount}
}

function getTimeout(delays, durations): number {
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }

  return Math.max.apply(null, durations.map((d, i) => {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs(s: string): number {
  return Number(s.slice(0, -1)) * 1000
}

