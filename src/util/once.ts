/**
 * 保证函数 fn 只会被调用一次，并且以后每次调用都会返回第一次的结果
 */
export default function(fn: (...args) => any) {
  let called = false
  let value
  return function(...args) {
    if (called) return value
    called = true
    value = fn.apply(this, args)
    return value
  }
}
