import * as React from 'react'
import {applyMixins} from '../../util/applyMixins'
import {warn} from '../../util/warn'


export interface Scrollable {
  scrollTop?: number
  getScrollableContainer?: () => HTMLElement
}

export abstract class Scrollable extends React.PureComponent<any, any> {
  /**
   * 在继承的子类添加上
   *
   * ```
   * scrollTop: number
   * ```
   *
   * 就可以用它去获取或设置页面的 scrollTop
   */
  static apply() {
    let base = {
      getScrollableContainer() {
        return document.documentElement
      },

      get scrollTop(): number {
        let container = this.getScrollableContainer()
        if (!container) {
          warn('没有 container，无法获取滚动位置')
          return 0
        }

        // 某些移动端滚动使用的是 body，桌面端使用的是 html
        return container.scrollTop || (container === document.documentElement && document.body.scrollTop) || 0
      },

      set scrollTop(value: number) {
        let container = this.getScrollableContainer()
        if (!container) {
          warn('没有 container，无法滚动到指定的位置')
          return
        }

        // 某些移动端滚动使用的是 body，桌面端使用的是 html
        container.scrollTop = value
        if (container === document.documentElement) document.body.scrollTop = value
      }
    }

    return (Ctor: any) => applyMixins(Ctor, [Scrollable, base])
  }
}
