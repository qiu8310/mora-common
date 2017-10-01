import {iterateInheritedPrototype} from '../iterateInheritedPrototype'

test('no extends', () => {
  class A {}

  let includeSpy = jest.fn()
  let excludeSpy = jest.fn()
  iterateInheritedPrototype(includeSpy, A, A, true)
  iterateInheritedPrototype(excludeSpy, A, A, false)

  expect(includeSpy).toHaveBeenCalledTimes(1)
  expect(includeSpy.mock.calls).toEqual([[A.prototype]])

  expect(excludeSpy).toHaveBeenCalledTimes(0)
})

test('one extends', () => {
  class A {}
  class B extends A {}

  let includeSpy = jest.fn()
  let excludeSpy = jest.fn()
  iterateInheritedPrototype(includeSpy, B, A)
  iterateInheritedPrototype(excludeSpy, B, A, false)

  expect(includeSpy).toHaveBeenCalledTimes(2)
  expect(includeSpy.mock.calls).toEqual([
    [B.prototype],
    [A.prototype]
  ])

  expect(excludeSpy).toHaveBeenCalledTimes(1)
  expect(excludeSpy.mock.calls).toEqual([
    [B.prototype]
  ])
})

test('double extends', () => {
  class A {}
  class B extends A {}
  class C extends B {}

  let spy = jest.fn()
  iterateInheritedPrototype(spy, C, A, true)
  expect(spy).toHaveBeenCalledTimes(3)
  expect(spy.mock.calls).toEqual([
    [C.prototype],
    [B.prototype],
    [A.prototype]
  ])
})

test('interrupt iterate from callback', () => {
  class A {}
  class B extends A {}
  class C extends B {}

  let spy = jest.fn()
  spy.mockImplementationOnce(() => true)
    .mockImplementationOnce(() => false)

  iterateInheritedPrototype(spy, C, A, true)
  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy.mock.calls).toEqual([
    [C.prototype],
    [B.prototype]
  ])
})

test('prototype as arguments', () => {
  class A {}
  class B extends A {}

  let includeSpy = jest.fn()
  iterateInheritedPrototype(includeSpy, B.prototype, A.prototype)

  expect(includeSpy).toHaveBeenCalledTimes(2)
  expect(includeSpy.mock.calls).toEqual([
    [B.prototype],
    [A.prototype]
  ])
})
