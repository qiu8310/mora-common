import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {applyMixins} from '../../util/applyMixins'
import {onview} from '../../dom/onview'
import {toArray} from '../../util/array'

export type IResizableOnResize = (rect: ClientRect, lastRect: ClientRect | undefined) => void
export type IResizableGetInsideContainer = () => Element
export interface IResizableApplyOptions {
  direction?: 'width' | 'height' | Array<'width' | 'height'>
  throttle?: number
  debounce?: number
}

export interface Resizable {
  __resizableOff?: any
  __resizableRect?: ClientRect
  getInsideContainer?: IResizableGetInsideContainer
}

export abstract class Resizable extends React.PureComponent<any, any> {
  static apply({direction = 'width', throttle = 200, debounce = 0}: IResizableApplyOptions = {}) {
    let directions = toArray(direction)
    let base = {
      getInsideContainer(this: Resizable) {
        return ReactDOM.findDOMNode(this)
      },
      componentDidMount(this: Resizable) {
        this.__resizableOff = onview(() => {
          let el: Element = (this as any).getInsideContainer()
          let rect = el.getBoundingClientRect()
          let lastRect = this.__resizableRect
          this.__resizableRect = rect

          if (
            !lastRect
            || directions.indexOf('width') >= 0 && rect.width !== lastRect.width
            || directions.indexOf('height') >= 0 && rect.height !== lastRect.height
          ) {
            this.onResize(rect, lastRect)
          }

        }, {events: ['resize', 'orientationchange', 'load', 'pageshow'], throttle, debounce})
      },
      componentWillUnmount(this: Resizable) {
        this.__resizableOff()
      }
    }
    return (Ctor: any) => applyMixins(Ctor, [Resizable, base], { merges: ['componentDidMount', 'componentWillUnmount'] })
  }

  abstract onResize(rect: ClientRect, lastRect: ClientRect | undefined): void
}
