import escapeRegExp from 'mora-scripts/libs/lang/escapeRegExp'
import iterateInheritedPrototype from './iterateInheritedPrototype'
import getPrototypeOf from './getPrototypeOf'

/**
 *
 * @export
 * @param {any} context - 当前对象实例
 * @param {any} toCtor  - 对象实例继承的最底层的基类，也就是不用调用 super.xxx 的那个类
 * @param {string[]>} keys - 所有需要调用 super.xxx 的方法，
 *                        子类如果实现了 methods 中的某一个方法 foo，都需要在执行开始调用 super.foo(...)
 *
 * @example
 * 假设 class A extends B
 *
 * 在 B 的 constructor 中调用 checkSuperCall(this, B, ['foo'])
 * 则，如果在 A 中要覆盖 foo 方法，需要这样写
 *
 * class A {
 *   foo() {
 *     super.foo()
 *     ...
 *   }
 * }
 */
export default function(context: any, toCtor: any, keys: string[]) {
  let fromProto = getPrototypeOf(context)
  let toProto = toCtor.prototype

  // let recentPropMethods = {}

  let chains = getProtos(fromProto, toProto)
    .reverse() // 从父到子遍历
    .map(prop => ({
      // 当前原型
      prop,
      // 当前原型上的属于 keys 中的所有方法
      methods: keys.reduce((methods, key) => {
        if (prop.hasOwnProperty(key)) methods[key] = prop[key]
        return methods
      }, {})
    }))
    .reverse() // 恢复顺序

  // chains.forEach(({prop, methods}) => {

  // })
  // getProtos(fromProto, toProto).reverse().for

  /*
  methods = methods.filter(m => baseProto.hasOwnProperty(m))

  iterateInheritedPrototype((proto) => {
    methods.forEach(method => {
      if (proto.hasOwnProperty(method)) {
        let fn = proto[method]
        if (fn === baseProto[method]) return // 子类的方法和父类一样，则忽略

        // 函数中至少需要有两个 method，不能保证 100% 正常
        // 但如果只有一个 method，则肯定是没有调用 super.method 函数
        let matches = fn.toString().match(new RegExp(escapeRegExp(method), 'g'))
        if (matches && matches.length < 2) {
          console.warn(
            `Child component %s.${method} method should call %o to trigger executing parent component method`,
            (proto.constructor as any).name,
            `super.${method}()`
          )
        }
      }
    })
  }, context, toCtor)
  */
}

function getProtos(fromProto, toProto) {
  let protos = []
  iterateInheritedPrototype(_ => { protos.push(_) }, fromProto, toProto)
  return protos
}
