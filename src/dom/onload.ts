export default function(fn: () => void): void {
  let done
  let cb = () => {
    if (!done) {
      done = true
      window.removeEventListener('DOMContentLoaded', cb)
      window.removeEventListener('load', cb)
      fn()
    }
  }

  window.addEventListener('DOMContentLoaded', cb)
  window.addEventListener('load', cb)

  if (document.readyState === 'complete') cb()
}
