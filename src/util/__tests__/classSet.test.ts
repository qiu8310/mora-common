import {classSet, classMap} from '../classSet'

// classSet

test('string arguments to class', () => {
  expect(classSet('a b')).toBe('a b')
  expect(classSet('a', 'b')).toBe('a b')
  expect(classSet('a', 'b', 'c')).toBe('a b c')
})

test('object arguments keys to class', () => {
  expect(classSet({a: true, b: {}})).toBe('a b')
  expect(classSet({'a': null, 'b c': true})).toBe('b c')
  expect(classSet({a: true}, {b: false}, {c: true})).toBe('a c')
})

test('array arguments to class', () => {
  expect(classSet(['a', 'b'])).toBe('a b')
  expect(classSet(['a', false, 'b'])).toBe('a b')
  expect(classSet(['a'], ['b'])).toBe('a b')
  expect(classSet(['a'], [{b: true}])).toBe('a b')
})

test('any arguments to class', () => {
  expect(classSet(true, false, 'a', null, undefined, ['b'], {c: true})).toBe('a b c')
})


// classMap

test('class name transform to locals values', () => {
  expect(classMap({foo: 'a', bar: 'b'}, 'foo bar')).toBe('a b')
})

test('class name not exists in locals will out warning if not in production', () => {
  let oldEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'developer'

  let warn = jest.spyOn(console, 'warn')
  warn.mockImplementation(_ => _)

  expect(classMap({foo: 'xxx'}, 'bar')).toBe('')
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn).toBeCalledWith('class "bar" not exists in %o', {foo: 'xxx'})

  warn.mockRestore()
  process.env.NODE_ENV = oldEnv
})

test('class name not exists in locals will not out warning if in production', () => {
  let oldEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'

  let warn = jest.spyOn(console, 'warn')
  warn.mockImplementation(_ => _)

  expect(classMap({foo: 'xxx'}, 'bar')).toBe('')
  expect(warn).toHaveBeenCalledTimes(0)

  warn.mockRestore()
  process.env.NODE_ENV = oldEnv
})
