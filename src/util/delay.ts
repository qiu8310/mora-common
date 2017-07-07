export function debounce(fn: () => void, ms: number): () => void {
  let sid
  return () => {
    if (sid) {
      clearTimeout(sid)
      sid = null
    }
    sid = setTimeout(fn, ms)
  }
}

export function throttle(fn: () => void, ms: number): () => void {
  let lastCall: number = 0
  return () => {
    if (Date.now() - lastCall >= ms) {
      fn()
      lastCall = Date.now()
    }
  }
}
