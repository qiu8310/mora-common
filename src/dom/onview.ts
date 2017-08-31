import {throttle as throttleCall, debounce as debounceCall} from '../util/delay'
import onload from './onload'

export declare type IOnViewOptionsEvent = 'load' | 'resize' | 'scroll' | 'orientationchange'
export interface IOnViewOptions {
  events?: IOnViewOptionsEvent | IOnViewOptionsEvent[]
  throttle?: number
  debounce?: number
  container?: Element
}

// debounce & throttle: http://drupalmotion.com/article/debounce-and-throttle-visual-explanation
export default function onview(fn: () => void, options: IOnViewOptions = {}): () => void {
  let {throttle = 0, debounce = 0, container = null, events = ['load', 'resize', 'scroll', 'orientationchange']} = options
  let cb

  if (throttle && throttle > 0) {
    cb = throttleCall(fn, throttle)
  } else if (debounce && debounce > 0) {
    cb = debounceCall(fn, debounce)
  } else {
    cb = fn
  }

  let eventArray = [].concat(events)
  eventArray.forEach(type => {
    let c: any = window
    if (type === 'load') {
      return onload(cb)
    } else if (type === 'scroll') {
      c = container || window
    }
    c.addEventListener(type, cb)
  })

  return () => {
    eventArray.forEach(type => {
      let c: any = window
      if (type === 'load') {
        return
      } else if (type === 'scroll') {
        c = container || window
      }
      c.removeEventListener(type, cb)
    })
  }
}
