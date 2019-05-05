import {transitionProp, animationProp, transitionEndEvent, animationEndEvent} from './style'

export namespace onTransitionEnd {
  export type AnimateType = 'transition' | 'animation'
}

const TRANSITION: onTransitionEnd.AnimateType = 'transition'
const ANIMATION: onTransitionEnd.AnimateType = 'animation'


export function onTransitionEnd(el: Element, callback: () => any, expectAnimType?: onTransitionEnd.AnimateType) {
  let res: ReturnType<typeof getTransitionInfo>
  // IE 9 中没有 transition animation 相关样式
  try {
    res = getTransitionInfo(el, expectAnimType)
  } catch (e) {
    return callback()
  }

  const {type, timeout, propCount} = res
  if (!type) return callback()
  let event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    el.removeEventListener(event, onEnd)
    callback()
  }
  const onEnd = (e: any) => {
    if (e.target === el) {
      if (++ended >= propCount) end()
    }
  }

  setTimeout(() => {
    if (ended < propCount) end()
  }, timeout + 1)

  el.addEventListener(event, onEnd)
}

export function getTransitionInfo(el: Element, expectAnimType?: onTransitionEnd.AnimateType) {
  const styles = window.getComputedStyle(el) as any
  const transitionDelays: string[] = styles[transitionProp + 'Delay'].split(', ')
  const transitionDurations: string[] = styles[transitionProp + 'Duration'].split(', ')
  const transitionTimeout: number = getTimeout(transitionDelays, transitionDurations)

  const animationDelays: string[] = styles[animationProp + 'Delay'].split(', ')
  const animationDurations: string[] = styles[animationProp + 'Duration'].split(', ')
  const animationTimeout: number = getTimeout(animationDelays, animationDurations)

  let type: onTransitionEnd.AnimateType | undefined
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
      : undefined
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }
  return {type, timeout, propCount}
}

function getTimeout(delays: string[], durations: string[]): number {
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
