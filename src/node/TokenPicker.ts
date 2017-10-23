/**
 * 很多 API 接口需要使用 token 去拉数据，
 * 每个 token 限制了请求次数，次数用完了
 * 就不能使用，要过一定时间才能用，要么你
 * 只能换 token
 *
 * 此脚本是方便用户同时提供多个 token，此程序会动态调用对应的
 * token，如果某个 token 到期了，则会把它放入过期列表中，只有
 * 时间到了才会重新启用
 */
import * as assign from 'mora-scripts/libs/lang/assign'
import * as Config from 'mora-scripts/libs/storage/Config'
import * as Storage from 'mora-scripts/libs/storage/Storage'
import * as FileStorage from 'mora-scripts/libs/storage/FileStorage'

import {Partial} from '../type/Object'

export interface ITokenPickerOptions {
  /**
   * token 超过使用限制后多长时间才能恢复；
   * 另外此值也可以在给 token 设置过期的时候单独指定
   */
  recoverSeconds?: number

  /**
   * 指定文件路径，用于记录 token 使用信息
   */
  recordFile?: string
}

interface ITokenObject {
  token: string
  lastUsedTimestamp: number
  availableTimestamp: number
}

/**
 * @example
 * let tp = new TokenPicker(['token1', 'token2'])
 *
 * while ((let token = tp.token)) {
 *  // do something
 *
 *  tp.expire() / break
 * }
 */
export class TokenPicker {
  public tokens: string[] = []
  private options: ITokenPickerOptions = {
    recoverSeconds: 30 * 24 * 3600,   // 默认一个月
    recordFile: null
  }
  private currentToken: string
  private config: Config

  constructor(tokens: string[], options?: ITokenPickerOptions) {
    options = assign(this.options, options)

    let storageOpts = {format: 2, autoInit: true, file: options.recordFile}
    let storage = options.recordFile ? new FileStorage(storageOpts) : new Storage(storageOpts)

    this.config = new Config(storage)
    this.options = options

    tokens.forEach(t => {
      if (this.tokens.indexOf(t) < 0) this.tokens.push(t)
    })

    this.initTokens(this.tokens)
  }

  /**
   *  获取最近未使用的 token
   */
  get token(): string {
    let {tokenObjects, currentToken} = this
    if (currentToken) return currentToken

    let now = Date.now()
    let availableTokenObjects = tokenObjects
      .filter(obj => now > obj.availableTimestamp)
      .sort((a, b) => a.lastUsedTimestamp - b.lastUsedTimestamp)

    if (!availableTokenObjects.length) return

    this.currentToken = availableTokenObjects[0].token
    availableTokenObjects[0].lastUsedTimestamp = now
    this.tokenObjects = tokenObjects

    return this.currentToken
  }

  /**
   * 将当前的 token 设置为过期
   * @param {number} [availableTimestamp=0] 指定下次可用的时间，不指定的话默认就是 "当前时间 + recoverSeconds"
   */
  expire(availableTimestamp: number = 0): TokenPicker {
    if (this.currentToken) {
      this.updateTokenObject(
        this.currentToken,
        {availableTimestamp: availableTimestamp || Date.now() + this.options.recoverSeconds * 1000}
      )
      this.currentToken = null
    }
    return this
  }

  /**
   * 循环执行某个操作，直到成功或所有 token 都用完了
   *
   * 如果没有 token，会抛出异常
   */
  do(callback: (token: string, expire: (availableTimestamp?: number) => void) => void) {
    let next = () => {
      let {token} = this

      if (token) {
        callback(
          token,
          (availableTimestamp) => {
            this.expire(availableTimestamp)
            next()
          }
        )
      } else {
        throw new Error('No available tokens')
      }
    }
    next()
  }

  private get tokenObjects(): ITokenObject[] {
    return this.config.get('tokens') || []
  }

  private set tokenObjects(tokens: ITokenObject[]) {
    this.config.set('tokens', tokens)
  }

  private updateTokenObject(token: string, obj?: Partial<ITokenObject>) {
    let {tokenObjects} = this
    assign(tokenObjects.filter(o => o.token === token)[0], obj)
    this.tokenObjects = tokenObjects
  }

  private initTokens(tokens: string[]): void {
    let tokenObjectsMap = this.tokenObjects.reduce((map, obj) => {
      map[obj.token] = obj
      return map
    }, {})

    tokens.forEach(token => {
      if (!tokenObjectsMap.hasOwnProperty(token)) {
        tokenObjectsMap[token] = {token, lastUsedTimestamp: 0, availableTimestamp: 0}
      }
    })

    this.tokenObjects = tokens.map(token => tokenObjectsMap[token])
  }
}
