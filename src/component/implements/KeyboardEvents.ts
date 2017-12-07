import * as React from 'react'
import {applyMixins} from '../../util/applyMixins'
import {KeyCode as K, FunctionKeyCode, PrintKeyCode} from '../../dom/KeyCode'

const FKeyMap = reverse(FunctionKeyCode)
const PKeyMap = reverse(PrintKeyCode)

const base = {
  componentDidMount(this: KeyboardEvents) {
    let handle: any = (e: KeyboardEvent) => {
      const keySep = /\s*,\s*/
      const segSep = /\s*\+\s*/
      filter(Object.keys(this.keyboard).reduce((map, key) => {
        key.split(keySep).map(k => {
          let ks = k.toLowerCase().split(segSep)
          let printChar = ks.pop()
          ks.sort().push(printChar as string) // 将 shift, ctrl, meta, alt 安字母顺序排序
          map[ks.join('+')] = this.keyboard[key]
        })
        return map
      }, {} as any), e)
    }

    document.addEventListener('keydown', handle)
    document.addEventListener('keypress', handle)

    this.__keyboardEventOff = () => {
      document.removeEventListener('keydown', handle)
      document.removeEventListener('keypress', handle)
    }
  },

  componentWillUnmount(this: KeyboardEvents) {
    this.__keyboardEventOff()
  }
}

export interface KeyboardEvents {
  __keyboardEventOff?: any
}
export abstract class KeyboardEvents extends React.PureComponent<any, any> {
  static apply() {
    return (Ctor: any) => applyMixins(Ctor, [KeyboardEvents, base], {merges: ['componentDidMount', 'componentWillUnmount']})
  }

  abstract keyboard: {[key: string]: (e: KeyboardEvent, key: string) => boolean | void}
}

/*
 *  每次按键，一般都会有keydown,keypress全过来，用这个函数来过滤，看用户按下的到底是什么按键
 *  keydown/keyup 是两个低层的事件，而 keypress 则属于用户层吧，一般只有在用户按下的键可以打印出来才会触发这个keypress
 */
function filter(map: {[key: string]: (e: Event, m: string) => any}, e: KeyboardEvent) {
  let modifiers = ''  // 表示 Alt,Ctrl,Meta,Shift这些前缀
  let keyname = null	// 键盘上显示的名字

  if (e.type === 'keydown') {
    let code = e.keyCode

    //  Alt, Ctrl, Shift, Cmd 按下则忽略
    if ([K.shift, K.ctrl, K.alt, K.lmeta, K.rmeta].indexOf(code) >= 0) return

    keyname = FKeyMap[code]

    // 按下的不是功能键，如果 Alt/Ctrl/Meta 按下了则就把这个键当作打印键
    if (!keyname && (e.altKey || e.ctrlKey || e.metaKey)) {
      keyname = PKeyMap[code]
    }

    if (keyname) {
      // 按字母顺序排列
      if (e.altKey) modifiers += 'alt+'
      if (e.ctrlKey) modifiers += 'ctrl+'
      if (e.metaKey) modifiers += 'meta+'
      if (e.shiftKey) modifiers += 'shift+'
    } else {
      return
    }
  } else if (e.type === 'keypress') {
    // keydown 的时候已经处理了这两个键
    if (e.altKey || e.ctrlKey || e.metaKey) return
    // 在Firefox中，不可打印的字符也会触发 keypress 事件，我们要忽略它
    if (e.charCode !== undefined && e.charCode === 0) return
    // Firefox 把打印的字符的ASCII码保存在 charCode 上，而IE保存在 keyCode上
    let code = e.charCode || e.keyCode
    keyname = String.fromCharCode(code)
    let lowercase = keyname.toLowerCase()
    if (keyname !== lowercase) { // 处理 a-z 的大小写情况
      keyname = lowercase
      modifiers = 'shift+'
    }
  }

  let func = map[modifiers + keyname]
  if (typeof func === 'function') {
    if (func(e, modifiers + keyname) === false) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

function reverse(obj: any) {
  return Object.keys(obj).reduce((all, k) => {
    all[obj[k]] = k
    return all
  }, {} as any)
}
