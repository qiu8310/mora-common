/* tslint:disable:no-empty */

/**
 * MDN: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
 *
 * Use Case:
 *  1. A site has an image carousel that shouldn't advance to the next slide
 *     unless the user is viewing the page.
 *  2. An application showing a dashboard of information doesn't want to poll
 *     the server for updates when the page isn't visible.
 *  3. A page wants to detect when it is being prerendered so it can keep
 *     accurate count of page views.
 *  4. A site wants to switch off sounds when a device is in standby mode
 *     (user pushes power button to turn screen off)
 */
import Events from 'mora-scripts/libs/lang/Events'
let event = new Events()

const doc = document
const prefixes = ['', 'webkit', 'moz', 'ms', 'o']


export interface IEvent {
  type: IState
  originalEvent: any
}
export declare type IState = 'visible' | 'hidden' | 'prerender' | 'unloaded'
export declare type IEventHandler = (IEvent) => void
/**
 * unbind current listener functions
 */
export declare type IEventOffHandler = () => void

// 初始化
let isSupported: boolean = false
let hiddenKey: string
let visibilityChangeEvent: string
let visibilityStateKey: string
let state: IState

Object.keys(prefixes).some(prefix => {
  hiddenKey = prefixed(prefix, 'hidden')
  if (typeof doc[hiddenKey] !== 'undefined') {
    isSupported = true
    visibilityChangeEvent = prefix + 'visibilitychange'
    visibilityStateKey = prefixed(prefix, 'visibilityState')
    return true
  }
})

if (isSupported) {
  state = getVisibilityState()
  doc.addEventListener(visibilityChangeEvent, listener)
} else {
  state = 'visible'
}

/**
 * visible/hidden/prerender/unloaded
 * @returns IState
 */
function getVisibilityState(): IState { return isSupported ? doc[visibilityStateKey] : 'visible' }

function listener(e) {
  let currentState = getVisibilityState()
  if (currentState !== state) {
    state = currentState
    event.emit(state, {type: state, originalEvent: e})
  }
}

function noop() {}

export const PageVisibility = {
  /**
   * event 对象
   */
  event,

  /**
   * 是否支持 Page Visibility API
   * @type boolean
   */
  isSupported,

  /**
   * 当前 Page Visibility 的 state
   * @type string
   */
  get state(): IState { return state },

  /**
   * 当前 state 是否是 hidden
   * @type boolean
   */
  get isHidden(): boolean { return isSupported ? doc[hiddenKey] : false },

  /**
   * 当前 state 是否是 visible
   * @type boolean
   */
  get isVisible(): boolean { return isSupported ? !doc[hiddenKey] : true },

  /**
   * 监听 page 状态变化
   * @param {IState | IState[]} states - 状态名称，可以是数组，支持：visible/hidden/prerender/unloaded
   * @param {Function} handler - 回调函数
   * @returns {IEventOffHandler} - off bind
   */
  on(states: IState | IState[], handler: IEventHandler): IEventOffHandler {
    if (!isSupported) return noop
    event.on([].concat(states).join(' '), handler)
    return () => event.off(states, handler)
  },

  /**
   * 监听 page 状态变化，监听完即删除
   * @param {IState | IState[]} states - 状态名称，可以是数组，支持：visible/hidden/prerender/unloaded
   * @param {Function} handler - 回调函数
   * @returns {IEventOffHandler} - off bind
   */
  once(states: IState | IState[], handler: IEventHandler): IEventOffHandler {
    if (!isSupported) return noop
    event.once([].concat(states).join(' '), handler)
    return () => event.off(states, handler)
  }
}

function prefixed(prefix, prop) {
  return prefix ? prefix + prop.charAt(0) + prop.slice(1) : prop
}
