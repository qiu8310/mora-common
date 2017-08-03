interface PolyfillPromise<T> {
  /**
   * 不管 resolve 还是 reject，callback 都会执行
   */
  finally(callback?: () => T): Promise<T>
}
interface Promise<T> extends PolyfillPromise<T> {}

interface PolyfillPromiseConstructor {
  /**
   * 执行函数 fn，返回一个 Promise
   */
  try<T>(fn: () => T): Promise<T>
}
interface PromiseConstructor extends PolyfillPromiseConstructor {}

Promise.prototype.finally = function(callback) {
  let P = this.constructor
  return this.then(
    function(value) { return P.resolve(callback()).then(function() { return value }) },
    function(reason) { return P.resolve(callback()).then(function() { throw reason }) }
  )
}

Promise.try = function(fn: () => any) {
  return new Promise(function(resolve, reject) {
    resolve(fn())
  })
}
