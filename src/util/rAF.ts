export function rAF(fn: () => boolean | void): {destroy: () => void} {
  let w: any = window
  let canceled: boolean

  let request = w.requestAnimationFrame
    || w.webkitRequestAnimationFrame
    || w.mozRequestAnimationFrame
    || w.msRequestAnimationFrame
    || w.oRequestAnimationFrame
    || ((f: any) => setTimeout(f, 16))

  let cb = () => {
    if (!canceled && fn() !== false) request(cb)
  }
  request(cb)

  return {
    destroy: () => (canceled = true)
  }
}
