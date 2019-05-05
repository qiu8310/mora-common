import './promise'

export namespace polyfill {
  export type Item = 'array-include' | 'es6-shim' | 'promise-polyfill' | 'whatwg-fetch' | 'classList' | 'raf' // 注意： es6-shim 包含了 promise-polyfill
  export interface Options {
    /** 是否压缩 polyfill */
    pretty?: boolean
    /** 将 polyfill 脚本注入 head 还是 body，默认是 head */
    appendTo?: 'head' | 'body'
    /** polyfill 成功后的回调 */
    success?: () => void
    /** polyfill 失败后的回调 */
    error?: (e: ErrorEvent) => void
  }
}

// 资源示例：    https://res.hjfile.cn/lib/polyfill/array-include.min.js
// Concat示例:  https://res.hjfile.cn/lib/polyfill/??array-include.js,classList.js

const BASE_URL = 'https://res.hjfile.cn/lib/polyfill/'
const G: any = (function() {
  if (typeof window !== 'undefined') return window
  // @ts-ignore
  if (typeof global !== 'undefined') return global
  throw new Error('unable to locate global object')
})()

/**
 * 动态加载指定的 polyfills
 *
 * @export
 * @param polyfills 指定支持的 polyfill 列表（注意顺序，默认会根据指定的顺序加载）
 * @param opts 配置选项（支持 success/error 回调；支持指定将 js 加载到 head 还是 body；支持配置是否使用非压缩版本的脚本）
 */
export function polyfill(polyfills: polyfill.Item[], opts: polyfill.Options = {}): void {
  // es6 中包含了 promise，所以如果需要 es6，则将 promise 去掉
  if (polyfills.indexOf('es6-shim') >= 0) {
    let index = polyfills.indexOf('promise-polyfill')
    if (index >= 0) polyfills.splice(index, 1)
  }

  let files = polyfills
    .filter(p => test(p))
    .map(p => p + (opts.pretty ? '' : '.min') + '.js')

  let scriptSrc: string = ''
  if (files.length === 0) {
    promise()
    if (opts.success) opts.success()
    return
  } else if (files.length === 1) {
    scriptSrc = BASE_URL + files[0]
  } else {
    scriptSrc = BASE_URL + '??' + files.join(',')
  }

  loadScript(scriptSrc, opts)
}

function loadScript(src: string, opts: polyfill.Options) {
  let script = document.createElement('script') as any
  script.src = src
  script.type = 'text/javascript'

  script.onload = function(e: Event) {
    destroy()
    promise()
    if (opts.success) opts.success()
  }
  script.onerror = function(e: ErrorEvent) {
    destroy()
    if (opts.error) opts.error(e)
  }

  // sync way of adding script tags to the page
  let tag = document.getElementsByTagName(opts.appendTo || 'head')[0]
  tag.appendChild(script)

  function destroy() {
    script.onerror = null
    script.onload = null
    if (script.parentNode) script.parentNode.removeChild(script)
  }
}

function test(item: polyfill.Item): boolean {
  switch (item) {
    // @ts-ignore
    case 'array-include': return !Array.prototype.includes
    case 'promise-polyfill': return !G.Promise
    case 'whatwg-fetch': return !G.fetch
    // @ts-ignore
    case 'es6-shim': return !G.Promise || !G.Map || !G.Set || !G.Reflect || !String.prototype.startsWith || !Array.from || !Array.prototype.find || !Object.assign
    case 'classList': return G.document && !('classList' in G.document.createElement('_'))
    case 'raf': return !G.requestAnimationFrame || !G.cancelAnimationFrame
    default: return false
  }
}

function promise() {
  if (typeof Promise === 'undefined') return
  if (!Promise.prototype.finally) {
    Promise.prototype.finally = function<T>(callback: () => T): Promise<T> {
      let P = this.constructor as PromiseConstructor
      return this.then(
        function(value) { return P.resolve(callback()).then(function() { return value }) },
        function(reason) { return P.resolve(callback()).then(function() { throw reason }) }
      )
    }
  }

  if (!Promise.try) {
    Promise.try = function(fn: () => any) {
      return new Promise(function(resolve, reject) {
        resolve(fn())
      })
    }
  }
}
