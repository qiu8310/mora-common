import * as React from 'react'
import {Modal} from './Modal'
import {parseSimpleHTML} from './HTML'

import './style/Toast.scss'

export interface IToastOptions {
  animation?: string
  animationDuration?: string
  html?: boolean
  simpleHTML?: boolean
  instance?: JSX.ElementClass
  duration?: number
}

export interface IToastResult {
  destroy: () => void
}

export function toast(message: string | React.ReactNode, options: IToastOptions = {}): IToastResult {
  let {html, simpleHTML, instance, duration = 2500, animation = 'fadeIn', animationDuration} = options


  let el = typeof message !== 'string'
    ? <div className='wToast'>{message}</div>
    : html
      ? <div className='wToast' dangerouslySetInnerHTML={{__html: message}} />
      : <div className='wToast' children={simpleHTML ? parseSimpleHTML(message) : message} />

  let modalProps = {animation, animationDuration, nomask: true, minWidth: 100, minHeight: 'auto'}
  let {destroy} = Modal.dialog(modalProps, el, instance)

  let sid
  if (duration > 0) sid = setTimeout(destroy, duration)

  return {
    destroy: () => {
      if (sid) clearTimeout(sid)
      destroy()
    }
  }
}
