import {getPrototypeOf} from '../getPrototypeOf'

test('get Object prototype', () => {
  expect(getPrototypeOf({})).toBe(Object.prototype)
})

test('get class prototype', () => {
  class A {}
  expect(getPrototypeOf(new A())).toBe(A.prototype)
})

test('disable Object.getPrototypeOf', () => {
  let fn = Object.getPrototypeOf
  Object.getPrototypeOf = null as any
  class A {}
  expect(getPrototypeOf(new A())).toBe(A.prototype)
  Object.getPrototypeOf = fn
})
