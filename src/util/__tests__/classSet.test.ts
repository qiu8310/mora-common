import classSet from '../classSet'

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
