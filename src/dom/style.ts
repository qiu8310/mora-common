import {KeyOf} from '../type/type'
import {getWindow} from './dom'

let transitionProp = 'transition'
let transitionEndEvent = 'transitionend'
let animationProp = 'animation'
let animationEndEvent = 'animationend'

let w: any = window
if (w.ontransitionend === undefined && w.onwebkittransitionend !== undefined) {
  transitionProp = 'WebkitTransition'
  transitionEndEvent = 'webkitTransitionEnd'
}
if (w.onanimationend === undefined && w.onwebkitanimationend !== undefined) {
  animationProp = 'WebkitAnimation'
  animationEndEvent = 'webkitAnimationEnd'
}

export {transitionProp, animationProp, transitionEndEvent, animationEndEvent}

/** 获取指定的 css 属性值 */
export function css(el: HTMLElement, name: keyof CSSStyleDeclaration): string
/**
 * 设置指定的 css 属性
 *
 * **如果 value 指定为 number，则会自动加上 'px' 后缀**
 */
export function css(el: HTMLElement, name: keyof CSSStyleDeclaration, value: string | number): void
/**
 * 批量设置指定的 css 属性
 *
 * **如果 obj 中的 value 指定为 number，则会自动加上 'px' 后缀**
 */
export function css(el: HTMLElement, obj: {[key in keyof CSSStyleDeclaration]?: string | number}): void

export function css(el: HTMLElement, rawName: keyof CSSStyleDeclaration | {[key in keyof CSSStyleDeclaration]?: string | number}, value?: string | number): any {
  let obj: {[key in keyof CSSStyleDeclaration]: string | number} | undefined
  let name: keyof CSSStyleDeclaration | undefined
  if (value != null) {
    // @ts-ignore
    obj = {[rawName]: value}
  } else {
    if (typeof rawName === 'string') {
      name = rawName
    } else {
      obj = rawName as any
    }
  }

  if (name) {
    let s = getWindow(el).getComputedStyle(el, null)
    return s.getPropertyValue(name as string) || s[name] || ''
  } else if (obj) {
    let sty = toStyle(obj)
    Object.keys(sty).forEach(k => {
      // @ts-ignore
      el.style[k] = sty[k]
    })
  }
}


/**
 * 处理 style (自动加 vendor prefix，给数字加上 px 后缀)
 */
export function toStyle(obj: {[key in keyof CSSStyleDeclaration]?: string | number | null}) {
  let style: any = {}
  Object.keys(obj).forEach(rawKey => {
    let k = rawKey as Exclude<KeyOf<typeof obj>, number>
    if (obj[k] != null) {
      let assignKey = k
      if (transitionProp !== 'transition' && k.indexOf('transition') === 0) assignKey = (transitionProp + k.slice(10)) as any
      else if (animationProp !== 'animation' && k.indexOf('animation') === 0) assignKey = (animationProp + k.slice(9)) as any
      style[assignKey] = typeof obj[k] === 'number' ? obj[k] + 'px' : obj[k]
    }
  })
  return style
}
