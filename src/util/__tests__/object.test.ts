import {toObject} from '../object'

describe('object', () => {
  let A: any
  beforeAll(() => {
    A = class {
      static s1 = 's1' // 静态属性不会导出
      p = 'init'
      get pp() {
        return this.p
      }
      set pp(v: string) {
        this.p = v
      }
      invalid = () => { // 胖函数中使用了 this 就无法 bind 到新的 obj 上了
        return this.p
      }
      mp() {
        return this.p
      }
    }
  })
  test('basic', () => {
    expect(toObject(1)).toEqual({})
    expect(toObject(null)).toEqual({})
    expect(toObject({})).toEqual({})
    expect(toObject({a: 1})).toEqual({a: 1})
  })

  test('class', () => {
    let a = new A()
    let obj = toObject(a)
    expect(obj.p).toBe('init')
    expect(obj.pp).toBe('init')
    expect(obj.mp()).toBe('init')
    expect(obj.invalid()).toBe('init')

    obj.pp = '2'
    expect(obj.p).toBe('2')
    expect(obj.pp).toBe('2')
    expect(obj.mp()).toBe('2')
    expect(obj.invalid()).toBe('init')

    obj.p = '3'
    expect(obj.p).toBe('3')
    expect(obj.pp).toBe('3')
    expect(obj.mp()).toBe('3')
    expect(obj.invalid()).toBe('init')
  })

  test('class excludes', () => {
    let a = new A()
    let obj = toObject(a, {excludes: ['pp', 'invalid', 'p']})
    expect(obj).not.toHaveProperty('s1')
    expect(obj).not.toHaveProperty('pp')
    expect(obj).not.toHaveProperty('invalid')
    expect(obj).not.toHaveProperty('p')
    expect(obj).toHaveProperty('mp')

    expect(obj.mp()).toBeUndefined()
  })

  test('class extend', () => {
    class B extends A {
      pb = 'b'
    }
    let b = new B()
    expect(toObject(b)).toHaveProperty('pb')
    expect(Object.keys(toObject(b))).not.toContainEqual('constructor')
  })

})

