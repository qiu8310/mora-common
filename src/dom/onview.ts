import {throttle as throttleCall, debounce as debounceCall} from '../util/time'
import {onload} from './onload'
import {once} from '../util/once'
import {toArray} from '../util/array'

export namespace onview {
  export type EventType = 'load' | 'resize' | 'scroll' | 'orientationchange' | 'pageshow'
  export interface Options {
    events?: EventType | EventType[]
    throttle?: number
    debounce?: number
    container?: Element
  }
}

// debounce & throttle: http://drupalmotion.com/article/debounce-and-throttle-visual-explanation
export function onview(fn: (e: Event | {type: string}) => void, options: onview.Options = {}): () => void {
  let {throttle = 0, debounce = 0, container = null, events = ['load', 'resize', 'scroll', 'orientationchange', 'pageshow']} = options
  let cb: (e: any) => void

  if (throttle && throttle > 0) {
    cb = throttleCall(fn, throttle)
  } else if (debounce && debounce > 0) {
    cb = debounceCall(fn, debounce)
  } else {
    cb = fn
  }

  let eventArray = toArray(events)
  if (eventArray.indexOf('pageshow')) cb = wrapPageshow(cb)

  if (eventArray.indexOf('load') >= 0) onload(cb)
  eventArray = eventArray.filter(type => type !== 'load')

  eventArray.forEach(type => {
    // 指定了 container 的话，需要监听两个 scroll （保险起见）
    if (type === 'scroll' && container) container.addEventListener(type, cb)
    window.addEventListener(type, cb)
  })

  return once(() => {
    eventArray.forEach(type => {
      if (type === 'scroll' && container) container.removeEventListener(type, cb)
      window.removeEventListener(type, cb)
    })
  })
}

function wrapPageshow(cb: (e: any) => void): (e: any) => void {
  return (e) => {
    if (e && e.type === 'pageshow') {
      // Persisted user state
      if (e.persisted) cb(e)
    } else {
      cb(e)
    }
  }
}
