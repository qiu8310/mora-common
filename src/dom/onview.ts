import {throttle as throttleCall, debounce as debounceCall} from '../util/delay'
import {onload} from './onload'
import {once} from '../util/once'

export declare type IOnViewOptionsEvent = 'load' | 'resize' | 'scroll' | 'orientationchange' | 'pageshow'
export interface IOnViewOptions {
  events?: IOnViewOptionsEvent | IOnViewOptionsEvent[]
  throttle?: number
  debounce?: number
  container?: Element
}

// debounce & throttle: http://drupalmotion.com/article/debounce-and-throttle-visual-explanation
export function onview(fn: (e: Event | {type: string}) => void, options: IOnViewOptions = {}): () => void {
  let {throttle = 0, debounce = 0, container = null, events = ['load', 'resize', 'scroll', 'orientationchange', 'pageshow']} = options
  let cb

  if (throttle && throttle > 0) {
    cb = throttleCall(fn, throttle)
  } else if (debounce && debounce > 0) {
    cb = debounceCall(fn, debounce)
  } else {
    cb = fn
  }

  if (events.indexOf('pageshow')) cb = wrapPageshow(cb)

  let eventArray = [].concat(events)
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

function wrapPageshow(cb) {
  return (e) => {
    if (e && e.type === 'pageshow') {
      // Persisted user state
      if (e.persisted) cb(e)
    } else {
      cb(e)
    }
  }
}
