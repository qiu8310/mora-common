import * as React from 'react'
import * as assign from 'mora-scripts/libs/lang/assign'
import classSet from '../util/classSet'
import appendQuery from '../util/appendQuery'
import onview from '../dom/onview'
import {WhiteDotImage, BlackDotImage} from '../util/DotImages'

// import './styles/Image.scss'

let VIEW_WIDTH
let VIEW_HEIGHT

function setViewport() {
  VIEW_WIDTH = window.innerWidth || document.documentElement.clientWidth
  VIEW_HEIGHT = window.innerHeight || document.documentElement.clientHeight
}

export type IImageContainer = () => Element
export type IImageRatio = (devicePixelRatio: number) => string

export interface IImage extends React.HTMLProps<HTMLImageElement | HTMLDivElement> {
  src: string

  /** 启用 lazyload */
  lazyload?: boolean
  fade?: boolean
  offset?: number

  /** 如果启用 lazyload，可以指定一个源图片未加载前的一个小图片 */
  placeholdSrc?: 'black' | 'white' | string
  error?: (e) => void
  errorClass?: string
  successClass?: string
  loadingClass?: string

  /* image 在 container 中，默认 container 是 body */
  container?: Element | IImageContainer
  /* 当 container 是个函数的时候有效，表示每次都重新执行 container 函数 */
  noCacheContainer?: boolean

  /** 启用 retina 适配，当前图片的 pixel ratio，如果是函数，则返回一个加在 src 后的字符串，默认是 `dpr=[devicePixelRatio]:[ratio] */
  ratio?: number | IImageRatio

  /** 启用 background，即不使用 img 标签，而是使用指定的 component  */
  bg?: boolean

  /** 只有在 background 为 true 是，设置 component 才有效，默认是 div */
  component?: React.ComponentClass<any> | string
}

function loadImage(src: string, success: (e) => void, error: (e) => void) {
  let img = new Image()
  let successHandler = (e) => {
    success(e)
    off()
  }
  let errorHandler = (e) => {
    error(e)
    off()
  }
  let off = () => {
    img.removeEventListener('load', successHandler)
    img.removeEventListener('error', errorHandler)
  }

  img.addEventListener('load', successHandler)
  img.addEventListener('error', errorHandler)
  img.src = src
}

function inView(rect, viewport) {
  return rect.right >= viewport.left &&
    rect.bottom >= viewport.top &&
    rect.left <= viewport.right &&
    rect.top <= viewport.bottom
}

setViewport()
window.addEventListener('resize', setViewport)

export default class extends React.PureComponent<IImage, any> {
  static defaultProps = {
    lazyload: true,
    fade: true,
    offset: 100,
    placeholdSrc: WhiteDotImage,
    errorClass: 'wImage-loadError',
    successClass: 'wImage-loaded',
    loadingClass: 'wImage-loading',
    component: 'div'
  }

  loaded: boolean = false
  el: HTMLDivElement | HTMLImageElement
  private offBind: any
  private cachedContainer: Element


  get viewport() {
    // VIEW_HEIGHT 和 VIEW_WIDTH 会变化，所以需要用 get
    return {
      top: 0 - this.props.offset,
      left: 0 - this.props.offset,
      bottom: VIEW_HEIGHT + this.props.offset,
      right: VIEW_WIDTH + this.props.offset
    }
  }

  getContainer() {
    let {container, noCacheContainer} = this.props
    if (this.cachedContainer && !noCacheContainer) return this.cachedContainer
    this.cachedContainer = container
      ? typeof container === 'function' ? container() : container
      : null
    return this.cachedContainer
  }

  isInView(): boolean {
    let rect = this.el.getBoundingClientRect()

    let {viewport} = this
    let {offset} = this.props
    let container = this.getContainer()
    if (container) {
      let containerRect = container.getBoundingClientRect()
      if (inView(containerRect, viewport)) {
        let top = containerRect.top - offset
        let right = containerRect.right + offset
        let bottom = containerRect.bottom + offset
        let left = containerRect.left - offset
        return inView(rect, {
          top: top > viewport.top ? top : viewport.top,
          right: right < viewport.right ? right : viewport.right,
          bottom: bottom < viewport.bottom ? bottom : viewport.bottom,
          left: left > viewport.left ? left : viewport.left
        })
      } else {
        return false
      }
    } else {
      return inView(rect, viewport)
    }
  }

  getLazyloadSrc(): string {
    let {placeholdSrc} = this.props
    return placeholdSrc === 'black' ? BlackDotImage : placeholdSrc === 'white' ? WhiteDotImage : placeholdSrc
  }

  getRealSrc(): string {
    let {ratio, src} = this.props
    let dpr = window.devicePixelRatio || 1 // 低端机没有 devicePixelRatio 就当作 1 处理
    let query = typeof ratio === 'function' ? ratio(dpr) : `dpr=${dpr}:${ratio}`
    return ratio ? appendQuery(src, query) : src // 交给服务器处理图片的大小
  }

  load() {
    if (this.loaded) return
    this.loaded = true
    this.destroy()

    let {el} = this
    let {bg, error, successClass, errorClass, loadingClass, fade} = this.props

    if (loadingClass) el.classList.add(loadingClass)
    let src = this.getRealSrc()
    let successHandle = () => {
      if (bg) {
        el.style.backgroundImage = `url(${src})`
      } else {
        el.setAttribute('src', src)
      }
      if (loadingClass) el.classList.remove(loadingClass)
      if (successClass) el.classList.add(successClass)

      if (fade && ('transition' in el.style)) {
        el.style.opacity = '0'
        setTimeout(() => {
          /* tslint:disable */
          el.scrollTop
          /* tslint:enable */
          el.style.transition = 'opacity .6s ease-in'
          el.style.opacity = '1'
        }, 16)
      }
    }
    let errorHandle = (e) => {
      if (error) error(e)
      if (loadingClass) el.classList.remove(loadingClass)
      if (errorClass) el.classList.add(errorClass)
    }
    loadImage(src, successHandle, errorHandle)
  }

  componentDidMount() {
    let container = this.getContainer()
    if (typeof IntersectionObserver !== 'undefined') {
      // https://developers.google.com/web/updates/2016/04/intersectionobserver
      let io = new IntersectionObserver(
        entries => entries[0].intersectionRatio > 0 && this.load(),
        {root: container, rootMargin: this.props.offset + 'px'}
      )

      this.offBind = () => {
        io.disconnect()
      }
      io.observe(this.el)
    } else {
      this.offBind = onview(() => {
        if (!this.loaded && this.isInView()) this.load()
      }, {runOnLoaded: true, throttle: 200, container})
    }
  }

  destroy() {
    if (this.offBind) {
      this.offBind()
      this.offBind = null
    }
  }

  componentWillUnmount() {
    this.destroy()
  }

  render() {
    // 所有自定义属性需要列出来，不能注入到 props 中
    let {
      src, lazyload, fade, offset, placeholdSrc,
      error, errorClass, successClass, loadingClass,
      container, noCacheContainer,
      ratio, bg, component,
      style = {}, className, width, height, ...props
    } = this.props

    component = !bg ? 'img' : component

    src = lazyload ? this.getLazyloadSrc() : this.getRealSrc()
    className = classSet('wImage', className)
    let ref = (el: any) => this.el = el

    if (width) style.width = width
    if (height) style.height = height

    if (bg) {
      style.backgroundImage = `url(${src})`
      assign(props, {ref, className, style})
    } else {
      if (!style.display) style.display = 'block'
      assign(props, {ref, src, className, width, height, style})
    }

    return React.createElement(component as any, props)
  }
}
