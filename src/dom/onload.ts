import {once} from '../util/once'

export type IOnloadCallback = (e: Event | {type: string}) => void
export function onload(fn: IOnloadCallback): void {
  let cb: IOnloadCallback = once((e: any) => {
    window.removeEventListener('DOMContentLoaded', cb)
    window.removeEventListener('load', cb)
    fn(e)
  })

  window.addEventListener('DOMContentLoaded', cb)
  window.addEventListener('load', cb)

  if (document.readyState === 'complete') cb({type: 'complete'})
}
