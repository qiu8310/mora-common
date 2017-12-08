import * as React from 'react'
import {Scrollable} from '../component/implements/Scrollable'
import {Storable, IStoreFunc, IStorableProps} from '../component/implements/Storable'
import {onview} from '../dom/onview'
import {warn} from '../util/warn'

export interface IScrollToTopProps {
  scroll?: boolean
  container?: HTMLElement | (() => HTMLElement)
}

export interface IScrollRestoreProps extends IScrollToTopProps {
  id: string | number
}

export abstract class ScrollPosition<P extends IScrollToTopProps, S> extends React.Component<P, S> {
  scrolled = false

  abstract scroll(): void

  getContainer(): any {
    let {container} = this.props

    return container === undefined
      ? document.documentElement
      : typeof container === 'function'
        ? container()
        : container
  }

  componentDidMount() {
    if (!this.scrolled && this.props.scroll) {
      this.scroll()
      this.scrolled = true
    }
  }

  componentDidUpdate() {
    this.componentDidMount()
  }

  render() {
    return this.props.children as any
  }
}

@Scrollable.apply()
@Storable.apply()
export class ScrollRestore extends ScrollPosition<IScrollRestoreProps & IStorableProps, any> implements Scrollable, Storable {
  static defaultProps: Partial<IScrollRestoreProps & IStorableProps> = {
    scroll: true,
    storeKey: 'ScrollRestore',
    store: window
  }

  // implements
  scrollTop: number
  store: IStoreFunc
  storable: boolean

  private offview: any
  private unmount = false
  private lastScrollTop: number

  getScrollableContainer() {
    return this.getContainer()
  }

  componentWillMount() {
    // 保存上次的值，因为新进入一个页面，可能会触发 scroll，引起值被覆盖了
    // 等到页面加载完，需要 scroll 时就可以使用此时保存的值
    this.lastScrollTop = this.store(this.props.id) || 0
  }

  componentDidMount() {
    super.componentDidMount()

    let container = this.getScrollableContainer()
    if (!container) {
      warn('ScrollRestore： 指定的 container 不存在，默认只会监听 window 的滚动')
    }

    this.offview = onview((e) => {
      if (!this.unmount) {
        this.store(this.props.id, this.scrollTop)
      }
    }, {events: ['scroll'], container, throttle: 200})
  }
  componentWillUnmount() {
    this.unmount = true
    this.offview()
  }

  scroll() {
    this.scrollTop = this.lastScrollTop
  }
}

@Scrollable.apply()
export class ScrollToTop extends ScrollPosition<IScrollToTopProps, any> {
  static defaultProps: Partial<IScrollToTopProps> = {
    scroll: true
  }
  scrollTop: number
  getScrollableContainer() {
    return this.getContainer()
  }
  scroll() {
    this.scrollTop = 0
  }
}
