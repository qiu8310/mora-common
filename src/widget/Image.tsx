//#region import
import * as React from 'react'
import * as assign from 'mora-scripts/libs/lang/assign'
import {classSet} from '../util/classSet'
import {appendQuery} from '../util/url'
import {warn} from '../util/warn'
import {viewport} from '../dom/viewport'
import {loadImage} from '../dom/loadImage'
import {WhiteDotImage, BlackDotImage} from '../util/DotImages'
//#endregion

// 参考：
// LOADER: responsive-loader
// LAZYLOAD: https://github.com/afarkas/lazysizes

export type IImageContainer = () => Element
export type IImageRatio = (devicePixelRatio: number) => string

// NOTE: 增加了属性需要在 render 中指定
// 否则新的属性会注入进 div 或 img 中，造成 react 报错
export interface IImage extends React.HTMLProps<HTMLImageElement | HTMLDivElement> {
  enableIntersectionObserver?: boolean
  src: string
  /** 是否需要圆角，或指定圆角的大小 */
  rounded?: string | number | boolean
  /** 指定正方形的边长，类似于同时指定了 width 和 height */
  square?: string | number

  /** 启用 lazyload */
  lazyload?: boolean
  fade?: boolean | number
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

export class Image extends React.PureComponent<IImage, any> {
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
  destroied: boolean = false
  el: HTMLDivElement | HTMLImageElement
  private offBind: any
  private cachedContainer: Element

  getContainer() {
    let {container, noCacheContainer} = this.props
    if (this.cachedContainer && !noCacheContainer) return this.cachedContainer
    this.cachedContainer = container
      ? typeof container === 'function' ? container() : container
      : null
    if (process.env.NODE_ENV !== 'production' && typeof container === 'function' && !this.cachedContainer) {
      warn('你给 Image 组件设置了 container 函数，但函数返回了空，没有返回 dom')
    }
    return this.cachedContainer
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
    let {destroied, loaded, el} = this
    if (loaded || destroied) return

    this.loaded = true
    this.destroy()
    let {bg, error, successClass, errorClass, loadingClass, fade} = this.props

    if (loadingClass) el.classList.add(loadingClass)
    let src = this.getRealSrc()
    let successHandle = () => {
      if (!el) return // 执行此异步函数时，可能已经 destroy 过了
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
          el.style.transition = `opacity ${typeof fade === 'number' ? fade : 600}ms ease-in`
          el.style.opacity = '1'
        }, 16)
      }
    }
    let errorHandle = (e) => {
      if (!el) return // 执行此异步函数时，可能已经 destroy 过了
      if (error) error(e)
      if (loadingClass) el.classList.remove(loadingClass)
      if (errorClass) el.classList.add(errorClass)
    }
    loadImage(src, {success: successHandle, error: errorHandle})
  }

  componentDidMount() {
    let container = this.getContainer()
    let {enableIntersectionObserver, offset} = this.props
    this.offBind = viewport.listen(this.el, () => this.load(), {
      enableIntersectionObserver, container, offset, throttle: 200
    })
  }

  destroy() {
    this.destroied = true
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
      enableIntersectionObserver,
      src, lazyload, fade, offset, placeholdSrc,
      error, errorClass, successClass, loadingClass,
      container, noCacheContainer,
      ratio, bg, component,
      style = {}, className, square, width, height, rounded, ...props
    } = this.props

    component = !bg ? 'img' : component

    src = lazyload ? this.getLazyloadSrc() : this.getRealSrc()
    className = classSet('wImage', className)
    let ref = (el: any) => this.el = el

    // 有可能指定为 0
    if (square != null) {
      width = width == null ? square : width
      height = height == null ? square : height
    }
    if (width != null) style.width = width
    if (height != null) style.height = height
    if (rounded) style.borderRadius = rounded === true ? '50%' : rounded

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
