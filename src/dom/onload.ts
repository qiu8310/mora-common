import {once} from '../util/once'

export namespace onload {
  export type callback = (e: Event | {type: string}) => void
}

export function onload(callback: onload.callback): void {
  let cb: onload.callback = once((e: any) => {
    window.removeEventListener('DOMContentLoaded', cb)
    window.removeEventListener('load', cb)
    callback(e)
  })

  window.addEventListener('DOMContentLoaded', cb)
  window.addEventListener('load', cb)

  if (document.readyState === 'complete') cb({type: 'complete'})
}
