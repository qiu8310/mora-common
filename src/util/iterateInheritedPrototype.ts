import getPrototypeOf from './getPrototypeOf'

/**
 * 遍历继承关系类的 prototype
 *
 * @export
 * @param {Function} callback - 回调函数，函数参数是遍历的每个实例的 prototype，函数如果返回 false，会终止遍历
 * @param {any} fromCtor  - 要遍历的起始 class 或 prototype
 * @param {any} toCtor    - 要遍历的结束 class 或 prototype
 * @param {boolean} [includeToCtor=true] - 是否要包含结束 toCtor 本身
 *
 * @example
 * A -> B -> C
 *
 * 在 C 中调用： iterateInheritedPrototype(fn, A, C, true)
 * 则，fn 会被调用三次，分别是 fn(A.prototype) fn(B.prototype) fn(C.prototype)
 */
export default function(callback: (proto: Object) => boolean | void, fromCtor, toCtor, includeToCtor = true) {
  let proto = fromCtor.prototype || fromCtor
  let toProto = toCtor.prototype || toCtor

  while (proto) {
    if (!includeToCtor && proto === toProto) break
    if (callback(proto) === false) break
    if (proto === toProto) break
    proto = getPrototypeOf(proto)
  }
}
