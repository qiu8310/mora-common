export function onload(fn: (e) => void): void {
  let done
  let cb = (e) => {
    if (!done) {
      done = true
      window.removeEventListener('DOMContentLoaded', cb)
      window.removeEventListener('load', cb)
      fn(e)
    }
  }

  window.addEventListener('DOMContentLoaded', cb)
  window.addEventListener('load', cb)

  if (document.readyState === 'complete') cb({type: 'complete'})
}
