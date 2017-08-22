export function debounce(fn: (...args) => void, ms: number): (...args) => void {
  let sid
  return (...args) => {
    if (sid) {
      clearTimeout(sid)
      sid = null
    }
    sid = setTimeout(() => fn(...args), ms)
  }
}

export function throttle(fn: (...args) => void, ms: number): (...args) => void {
  let lastCall: number = 0
  return (...args) => {
    if (Date.now() - lastCall >= ms) {
      fn(...args)
      lastCall = Date.now()
    }
  }
}
