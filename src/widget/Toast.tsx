import * as React from 'react'
import {Modal} from './Modal'
import {parseSimpleHTML} from './HTML'

import './style/Toast.scss'

export interface IToastOptions {
  html?: boolean
  simpleHTML?: boolean
  instance?: JSX.ElementClass
  duration?: number
}

export function toast(message: string, options: IToastOptions = {}) {
  let {html, simpleHTML, instance, duration = 2500} = options

  let el = html
    ? <div className='wToast' dangerouslySetInnerHTML={{__html: message}} />
    : <div className='wToast' children={simpleHTML ? parseSimpleHTML(message) : message} />

  let {destroy} = Modal.dialog({animation: null, nomask: true}, el, instance)

  let sid
  if (duration > 0) sid = setTimeout(destroy, duration)

  return {
    destroy: () => {
      if (sid) clearTimeout(sid)
      destroy()
    }
  }
}
