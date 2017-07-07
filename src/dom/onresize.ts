import {throttle as throttleCall, debounce as debounceCall} from '../util/delay'
import onload from './onload'

// debounce & throttle: http://drupalmotion.com/article/debounce-and-throttle-visual-explanation
export default function onresize(fn: () => void, {runOnLoaded = true, throttle = 0, debounce = 0} = {}) {
  let cb

  if (throttle && throttle > 0) {
    cb = throttleCall(fn, throttle)
  } else if (debounce && debounce > 0) {
    cb = debounceCall(fn, debounce)
  } else {
    cb = fn
  }

  if (runOnLoaded) onload(cb)

  window.addEventListener('resize', cb, false)
}
