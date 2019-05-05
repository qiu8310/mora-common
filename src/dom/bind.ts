import {toArray} from '../util/array'
/**
 * document 事件监听函数
 *
 * 返回一个取消事件监听的函数
 */
export function bind<K extends keyof DocumentEventMap>(type: K | K[], handler: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void

/**
 * element 事件监听函数
 *
 * 返回一个取消事件监听的函数
 */
export function bind<K extends keyof DocumentEventMap>(el: Element | Document | Window, type: K | K[], handler: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void
export function bind<K extends keyof DocumentEventMap>(el: any, ...args: any[]) {
  if (typeof el === 'string' || Array.isArray(el)) {
    args.unshift(el)
    el = document
  }

  let offs = toArray(args[0]).map(type => {
    el.addEventListener(type, args[1], args[2])
    return () => el.removeEventListener(type, args[1], args[2])
  })

  return () => offs.forEach(off => off())
}

