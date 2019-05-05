import {toArray} from './array'

export namespace applyMixins {
  export interface Options<K = string> {
    /** 覆盖原有的键 */
    overwrites?: K[]
    /** 需要忽略的键 */
    ignores?: K[]
    /** 如果原生不存在，才使用的键 */
    fallbacks?: K[]
  }
}

/**
 * 注意此库中的 autobind 后会去除 value 属性，所以无法在 autobind 之后的函数上使用 merges
 *
 * 也无法在 getter setter 方法上使用 merges，因为它们也都没有 value
 */
export function applyMixins<T extends Function>(toCtor: T, fromCtors: any | any[], {overwrites = [], ignores = [], fallbacks = []}: applyMixins.Options = {}): T {
  const exists = Object.getOwnPropertyNames(toCtor.prototype)

  toArray(fromCtors).forEach(fromCtor => {
    if (!fromCtor) return

    let fromProp = typeof fromCtor === 'function' ? fromCtor.prototype : fromCtor

    Object.getOwnPropertyNames(fromProp).forEach(name => {
      if (name !== 'constructor' && !ignores.includes(name)) {
        let fromDesc = Object.getOwnPropertyDescriptor(fromProp, name) as PropertyDescriptor

        if (!exists.includes(name) || overwrites.includes(name)) {
          Object.defineProperty(toCtor.prototype, name, fromDesc)
        } else if (!fallbacks.includes(name)) {
          let toDesc = Object.getOwnPropertyDescriptor(toCtor.prototype, name)
          // merge 的必须要是函数
          if (toDesc && typeof toDesc.value === 'function' && typeof fromDesc.value === 'function') {
            Object.defineProperty(toCtor.prototype, name, {
              ...toDesc,
              value() {
                fromDesc.value.apply(this, arguments);
                (toDesc as PropertyDescriptor).value.apply(this, arguments)
              }
            })
          }
        }
      }

      // 下面方法不好地方在于，如果 class 中定义了 get 会触发 get 函数的执行
      // 而函数此时还没初始化，可能会报错
      // if (name !== 'constructor' && !toCtor.prototype[name]) {
      //   toCtor.prototype[name] = Ctor.prototype[name]
      // }
    })
  })
  return toCtor
}
