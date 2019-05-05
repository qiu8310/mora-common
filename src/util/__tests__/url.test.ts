import {url} from '../url'

const {buildSearch, parseSearch, appendQuery} = url

let bs = (q: url.Query) => decodeURIComponent(buildSearch(q))

const data = [
  ['空对象', {}, ''],
  ['基本对象', {a: '1', b: 'str'}, '?a=1&b=str'],
  ['对象中嵌套对象', {a: {b: '1'}}, '?a[b]=1'],
  ['对象中深层嵌套对象', {a: {b: {c: '1'}}}, '?a[b][c]=1'],
  ['对象中嵌套数组', {a: ['1', '2']}, '?a[0]=1&a[1]=2'],
  ['对象中深层嵌套数组', {a: ['1', ['2', '3']]}, '?a[0]=1&a[1][0]=2&a[1][1]=3'],
  ['数组和对象混合的模式', {a: ['1'], b: {c: '2'}}, '?a[0]=1&b[c]=2']
]

const complex = [
  ['a=1', {a: '1'}],
  ['a[]=1', {a: ['1']}],
  ['a[0]=0&a[]=1', {a: ['0', '1']}],
  ['&a=1&a=1&', {a: ['1', '1']}],
  ['a=1&a=2', {a: ['1', '2']}],
  ['a[b]=1&a[b]=2', {a: {b: ['1', '2']}}],
  ['a[a1]=1&a[a2]=2&b[b1]=3', {a: {a1: '1', a2: '2'}, b: {b1: '3'}}],
  ['a[3]=3&a[]=2', {a: ['2', '3']}],
  ['a[b]=2&a=3', {a: {b: '2', 0: '3'}}],
  ['a[b]=2&a[]=3', {a: {b: '2', 0: '3'}}],
  ['a=3&a[b][a]=2&a[b]=3', {a: {0: '3', b: {a: '2', 0: '3'}}}],
  ['a=1&a[1]=2&a[0]=3&a=4', {a: ['1', '4', '3', '2']}],
  ['a=1&a[1]=2&a[0]=3&a[]=4', {a: ['1', '3', '2', '4']}],
  ['a[0]=3&a=1&a[1]=2&a=4', {a: ['3', '2', '1', '4']}],
  ['a=3&a[b]=2&a[1]=3', {a: {0: '3', b: '2', 1: '3'}}],
  ['a[1]=3&a=3&a[b]=2', {a: {1: '3', 0: '3', b: '2'}}],
]

describe('url', () => {
  describe('buildSearch', () => {
    data.forEach(row => test(row[0] as string, () => expect(bs(row[1])).toEqual(row[2])))
  })

  describe('parseSearch', () => {
    data.forEach(row => test(row[0] as string, () => expect(parseSearch(row[2] as string)).toEqual(row[1])))
  })

  describe('parseSearch complex', () => {
    complex.forEach((row, i) => test('complex #' + i, () => expect(parseSearch(row[0] as string)).toEqual(row[1])))
  })

  describe('appendQuery', () => {
    test('should append string query', () => {
      expect(appendQuery('/a/b', '')).toEqual('/a/b')
      expect(appendQuery('/a/b', 'a=1&b=2')).toEqual('/a/b?a=1&b=2')
      expect(appendQuery('/a/b?c=0', 'a=1&b=2')).toEqual('/a/b?c=0&a=1&b=2')
      expect(appendQuery('/a/b?c=0#d=xx', 'a=1&b=2')).toEqual('/a/b?c=0&a=1&b=2#d=xx')
    })

    test('should append object query', () => {
      expect(appendQuery('/a/b', {})).toEqual('/a/b')
      expect(appendQuery('/a/b', {a: 1})).toEqual('/a/b?a=1')
      expect(appendQuery('/a/b?c=0', {a: 1})).toEqual('/a/b?c=0&a=1')
      expect(appendQuery('/a/b?c=0#d=xx', {a: 1})).toEqual('/a/b?c=0&a=1#d=xx')
    })
  })

})
