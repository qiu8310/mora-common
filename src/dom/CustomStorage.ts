import {warn} from '../util/logger'
import {toArray} from '../util/array'

export namespace CustomStorage {
  export interface Options {
    id?: string
    type?: 'local' | 'session'
    /** 过期毫秒数 */
    expireMS?: number
    /** 是否开启 cache 加速，默认开启 */
    memory?: boolean
    /** 内存中最大可存储的字符串长度（避免占用太多内存） */
    maxMemoryValueLength?: number
  }
}

const DEFAULT_OPTIONS: CustomStorage.Options = {
  id: 'v1',
  type: 'local',
  expireMS: 0,
  memory: true,
  maxMemoryValueLength: 300,
}

const globalCache: {[key: string]: any} = {}
// @ts-ignore
const PROJECT = typeof __PROJECT__ !== 'undefined' ? __PROJECT__ : 'cs'

export class CustomStorage {
  public id: string
  public memory: boolean

  // localStorage
  private options: Required<CustomStorage.Options>
  private store: Storage | null
  private cache: {[key: string]: any} = globalCache

  constructor(options: CustomStorage.Options = {}) {
    this.options = {...DEFAULT_OPTIONS, ...options} as any

    let {id, memory} = this.options

    let store

    try { // IE 8 或移动端的隐身模式 下直接调用 window.localStorage 会报错（其实也不用支持 IE8）
      store = this.options.type === 'session' ? window.sessionStorage : window.localStorage
      store.setItem('bs_:)_', '__')
      store.removeItem('bs_:)_')
    } catch (e) {
      /* istanbul ignore next */
      warn(`${this.options.type}Storage is not available, fallback to memory cache.`)
      store = null
    }

    if (!store) memory = true

    this.id = id
    this.memory = memory
    this.store = store
  }

  /**
   * 在不新建 Storage 实例的情况下，同步更新其它 ID 中的存储
   * @param {(string | string[])} ids - 所有需要同步更新的 ID
   * @param {(id: string) => void} fn - 执行更新的回调函数
   * @memberof CustomStorage
   */
  sync(ids: string | string[], fn: (this: CustomStorage, id: string) => void): void {
    let originalId = this.options.id

    toArray(ids).forEach(id => {
      this.options.id = id
      fn.call(this, id)
    })

    this.options.id = originalId
  }

  /**
   * 设置存储
   * @param {string} key  - 存储的键名
   * @param {*} value - 存储的值
   * @param {number} [ms] - 存储过期时间，默认永不过期
   * @memberof CustomStorage
   */
  set(key: string, value: any, ms: number = this.options.expireMS): void {
    let storeKey = this.getStoreKey(key)
    let expiredAt = ms ? Date.now() + ms : 0
    value = JSON.stringify([value, expiredAt])

    if (this.memory) {
      if (value.length <= this.options.maxMemoryValueLength) this.cache[storeKey] = value
      else delete this.cache[storeKey]
    }
    if (this.store) {
      this.store.setItem(storeKey, value)
    }
  }

  /**
   * 获取指定的存储的值
   * @template T
   * @param {string} key  - 存储的键名
   * @param {*} [defaultValue] - 如果存储不存在或过期，则返回此值
   * @returns {T} 存储的值
   * @memberof CustomStorage
   */
  get<T>(key: string, defaultValue?: any): T {
    let obj = this.rawget(key)
    return obj ? obj.value : defaultValue
  }

  /**
   * 判断指定的存储是否存在
   * @param {string} key - 存储的键名
   * @returns {boolean} 是否存在
   * @memberof CustomStorage
   */
  has(key: string): boolean {
    return !!this.rawget(key)
  }

  /**
   * 删除指定的存储
   * @param {string} key - 存储的键名
   * @memberof CustomStorage
   */
  del(key: string): void {
    let storeKey = this.getStoreKey(key)
    if (this.memory) delete this.cache[storeKey]
    if (this.store) this.store.removeItem(storeKey)
  }

  /**
   * 清空当前 Storage
   * @memberof CustomStorage
   */
  empty(): void {
    if (this.memory) {
      this.filter(this.cache, storeKey => delete this.cache[storeKey])
    }
    if (this.store) {
      this.filter(this.store, storeKey => (this.store as Storage).removeItem(storeKey))
    }
  }

  private filter(obj: {[key: string]: any}, fn: (key: string) => void) {
    let keyPrefix = this.getKeyPrefix()
    Object.keys(obj).forEach(storeKey => {
      if (storeKey.indexOf(keyPrefix) === 0) fn(storeKey)
    })
  }

  private getKeyPrefix(): string {
    let {id} = this.options
    return `:${PROJECT}:${id}:`
  }

  private getStoreKey(key: string): string {
    return this.getKeyPrefix() + key
  }

  private rawget(key: string) {
    let storeKey = this.getStoreKey(key)
    let rawVal = this.memory && this.cache[storeKey] || this.store && this.store.getItem(storeKey)
    if (!rawVal) return

    try {
      let [value, expiredAt] = JSON.parse(rawVal)
      if (expiredAt && Date.now() > expiredAt) {
        this.del(key)
        return
      }
      return {value}
    } catch (e) {
      return
    }
  }
}
