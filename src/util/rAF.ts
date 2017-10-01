export function rAF(fn: () => boolean | void): () => void {
  let w: any = window
  let canceled

  let request = w.requestAnimationFrame
    || w.webkitRequestAnimationFrame
    || w.mozRequestAnimationFrame
    || w.msRequestAnimationFrame
    || w.oRequestAnimationFrame

  if (request) {
    request = f => setTimeout(f, 16)
  }

  let cb = () => {
    if (!canceled && fn() !== false) request(cb)
  }
  request(cb)

  return () => (canceled = true)
}
