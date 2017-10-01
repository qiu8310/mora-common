import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {applyMixins} from '../../util/applyMixins'

export declare type IGetInsideContainer = () => Element
export declare type IOnClickOutside = (e: MouseEvent) => void

export abstract class OutsideClickable extends React.PureComponent<any, any> {
  /**
   * sensitive：默认情况下， react 绑定的 click 总会比手动绑定在 document 上的早触发，
   * 而且如果 react 的 click 有 setState 和 callback 总是会连续执行：可以理解为 setState -> render -> callback()
   * 当 sensitive 为 true 时，就可以保证手动绑定的事件比 react 绑定的先触发
   *
   * 使用手动绑定事件有个缺陷，就是 handle 不受 react 控制，所以每调用一次 setState 会立即触发 render 和 callback
   * 而不会等到函数执行完后将所有 state 综合起来再触发 render，所以在 onClickOutside 函数内要注意
   */
  static apply({sensitive = false} = {}) {
    return Ctor => applyMixins(
      Ctor,
      [OutsideClickable, {
        componentDidMount() {
          let handle = (e: MouseEvent) => {
            const root = this.getInsideContainer()
            if (!root || root.contains(e.target as Node) || root === e.target || (e.button && e.button !== 0)) return
            e.stopPropagation()
            this.onClickOutside(e)
          }
          document.addEventListener('click', handle, sensitive)
          this.__outsideClickableOff = () => {
            document.removeEventListener('click', handle, sensitive)
            this.__outsideClickableOff = null
          }
        },
        componentWillUnmount() {
          if (this.__outsideClickableOff) this.__outsideClickableOff()
        }
      }],
      {merges: ['componentDidMount', 'componentWillUnmount']}
    )
  }

  abstract onClickOutside: IOnClickOutside

  getInsideContainer(): Element {
    return ReactDOM.findDOMNode(this)
  }
}
