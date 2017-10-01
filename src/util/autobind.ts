
import {iterateInheritedPrototype} from './iterateInheritedPrototype'
import {getPrototypeOf} from './getPrototypeOf'

const WONT_BINDS: string[] = [
  'constructor',
  'render',
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount'
]

/**
 * @template O                        - 对象实例
 * @param {any} target                  - 对象实例
 * @param {string} method             - 对象实例上的一个方法的名称
 * @param {PropertyDescriptor} desc   - 方法的 descriptor
 */
export function autobind(target: any, method: string, desc: PropertyDescriptor): PropertyDescriptor

/**
 * @template F - 继承自 T 的类型，可以是 class
 * @template T - 继承自 Function 的类型，可以是 class
 * @param {F} fromCtor - 起始 class
 * @param {(T | string[])} [toCtorOrWontBinds] - 结束 class 或者是不需要绑定的方法的名称（默认是 React 生命周期相关的函数）
 */
export function autobind<F extends T, T extends Function>(fromCtor: F, toCtorOrWontBinds?: T | string[]): F

/**
 * @template F  - 继承自 T 的类型，可以是 class
 * @template T  - 继承自 Function 的类型，可以是 class
 * @param {F} fromCtor                - 起始 class
 * @param {T} toCtor                  - 结束 class
 * @param {string[]} [wontBinds = WONT_BIND]  - 不自动 bind 的所有方法的名称（默认是 React 生命周期相关的函数）
 */
export function autobind<F extends T, T extends Function>(fromCtor: F, toCtor?: T, wontBinds?: string[]): F

export function autobind(fromCtor, toCtor = null, wontBinds: any = WONT_BINDS) {
  if (!fromCtor.prototype && typeof toCtor === 'string' && !Array.isArray(wontBinds)) return autobindClassMethod(fromCtor, toCtor, wontBinds)

  if (Array.isArray(toCtor)) {
    wontBinds = toCtor
    toCtor = null
  }

  if (!toCtor) {
    // 只绑定当前的类，不递归绑定
    _iteraterProperty(fromCtor.prototype, wontBinds)
  } else {
    // @FIXED
    // A => B => C，如果在 A 上使用 autoBind，
    // 那么不只有 A 上的函数会 autoBind，
    // B，C 上的函数也都需要 autobind
    iterateInheritedPrototype(proto => _iteraterProperty(proto, wontBinds), fromCtor, toCtor, true)
  }
  return fromCtor
}

function autobindClassMethod(target: any, method: string, desc: PropertyDescriptor): any {
  return bindMethod(getPrototypeOf(target), method, desc)
}

function _iteraterProperty(proto, wontBinds) {
  Object.getOwnPropertyNames(proto)
    .filter(method => wontBinds.indexOf(method) < 0)
    .forEach(method => bind(proto, method, Object.getOwnPropertyDescriptor(proto, method)))
}

function bind(proto: any, method: string, desc: PropertyDescriptor) {
  if (typeof desc.value !== 'function') return // 此处避免了重复绑定，因为 bind 后都没有 value 值，所以不会出现重复绑定
  Object.defineProperty(proto, method, bindMethod(proto, method, desc))
}

function bindMethod(proto: any, method: string, {value: fn, configurable, enumerable}: PropertyDescriptor) {
  return {
    configurable,
    enumerable,
    get() {
      // 直接使用原型调用，如 Class.prototype.key
      if (this === proto || this.hasOwnProperty(method)) return fn

      // bind 一次就够了，此 bind 会自动根据子类切换 this 环境
      // 如：
      // A1 => B, A2 => B
      // 如果 A1 autobind 之后，B 上函数也会 autobind 到 A1
      // 而在 A2 autobind 之后，B 上函数不需要再 autoBind，但在 A2 上调用 B 上的方法是不会有问题的
      let boundFn = fn.bind(this)
      Object.defineProperty(this, method, {
        value: boundFn,
        configurable: true,
        writable: true
      })
      return boundFn
    },

    // 为了使子类可以覆写父类的方法
    set(value) {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        enumerable: true,
        value
      })
    }
  }
}
