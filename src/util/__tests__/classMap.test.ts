import classMap from '../classMap'

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
