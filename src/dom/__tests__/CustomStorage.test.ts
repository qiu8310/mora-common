jest.mock('../../util/warn')

import CustomStorage from '../CustomStorage'
import localStorage from './helper/localStorage'
import warn from '../../util/warn'

describe('cache', () => {
  test('warn will be called', () => {
    (warn as any).mock(() => new CustomStorage(), [['localStorage is not available, fallback to memory cache.']])
  })

  describe('basic', () => {
    let s: CustomStorage
    beforeEach(() => {
      s = new CustomStorage({id: 's'})
    })

    test('get not set key should return undefined', () => {
      expect(s.get('foo')).toBeUndefined()
    })

    test('get not set key with second argument should return second argument', () => {
      expect(s.get('foo', 'defaultValue')).toBe('defaultValue')
      expect(s.get('foo', true)).toBe(true)
    })

    test('set key with value', () => {
      s.set('foo', true)
      s.set('bar', null)
      expect(s.get('foo')).toBe(true)
      expect(s.get('bar')).toBe(null)
    })

    test('set key with expired seconds', done => {
      s.set('foo', true, 0.001)

      expect(s.get('foo')).toBe(true)
      setTimeout(() => {
        expect(s.get('foo')).toBeUndefined()
        done()
      }, 20)
    })

    test('del key', () => {
      expect(() => s.del('foo')).not.toThrow()
      s.set('foo', true)
      s.del('foo')
      expect(s.get('foo')).toBeUndefined()
    })

    test('empty keys', () => {
      s.set('a', true)
      s.set('b', false)
      s.empty()
      expect(s.get('a')).toBeUndefined()
      expect(s.get('b')).toBeUndefined()
    })

    test('sync store', () => {
      let s1 = new CustomStorage({id: 's1'})
      let s2 = new CustomStorage({id: 's2'})

      s.sync(['s', 's1', 's2'], (id) => s.set('name', id))
      s.sync(['s', 's1'], () => s.set('two', 's&s1'))
      s.sync('s2', () => s.set('three', 's2'))

      expect(s.get('name')).toBe('s')
      expect(s1.get('name')).toBe('s1')
      expect(s2.get('name')).toBe('s2')


      expect(s.get('two')).toBe('s&s1')
      expect(s1.get('two')).toBe('s&s1')
      expect(s2.get('two')).toBeUndefined()

      expect(s.get('three')).toBeUndefined()
      expect(s1.get('three')).toBeUndefined()
      expect(s2.get('three')).toBe('s2')

      s.sync(['s', 's2'], function() { this.empty() })
      expect(s.get('name')).toBeUndefined()
      expect(s1.get('name')).toBe('s1')
      expect(s2.get('name')).toBeUndefined()
    })

    test('max memory cache value', () => {
      s = new CustomStorage({id: 's', maxMemoryValueLength: 20})
      s.set('a', 'a')
      expect(s.get('a')).toBe('a')
      s.set('b', 'bbbbbbbbbbbbbbbbbbbbbb')
      expect(s.get('b')).toBeUndefined()
    })

  })
})

describe('store', () => {
  let s: CustomStorage
  let s1: CustomStorage
  let s2: CustomStorage
  let g: any
  beforeEach(() => {
    g = global
    g.window = {localStorage}

    s = new CustomStorage({id: 's', memory: false})
    s1 = new CustomStorage({id: 's1', memory: false})
    s2 = new CustomStorage({id: 's2', memory: false})

  })

})
