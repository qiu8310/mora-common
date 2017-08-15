import {throttle as throttleCall, debounce as debounceCall} from '../util/delay'
import onload from './onload'

// debounce & throttle: http://drupalmotion.com/article/debounce-and-throttle-visual-explanation
export default function onview(fn: () => void, {runOnLoaded = true, resize = true, scroll = true, container = null, throttle = 0, debounce = 0} = {}): () => void {
  let cb

  if (throttle && throttle > 0) {
    cb = throttleCall(fn, throttle)
  } else if (debounce && debounce > 0) {
    cb = debounceCall(fn, debounce)
  } else {
    cb = fn
  }

  if (runOnLoaded) onload(cb)

  if (resize) window.addEventListener('resize', cb)
  if (scroll) window.addEventListener('scroll', cb)
  if (container && scroll) container.addEventListener('scroll', cb)

  return () => {
    if (resize) window.removeEventListener('resize', cb)
    if (scroll) window.removeEventListener('scroll', cb)
    if (container && scroll) container.removeEventListener('scroll', cb)
  }
}
