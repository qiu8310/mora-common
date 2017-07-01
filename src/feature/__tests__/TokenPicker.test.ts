import {default as TokenPicker, ITokenPickerOptions} from '../TokenPicker'
import * as path from 'path'
import * as fs from 'fs-extra'

const fixturesDir = path.join(__dirname, 'fixtures')
fs.ensureDirSync(fixturesDir)

describe('Memory', () => {
  test('basic', (done) => {
    basicTest(done, {})
  })

  test('no duplicated tokens', () => {
    let tp = new TokenPicker(['t1', 't1'])
    expect(tp.tokens.length).toBe(1)
  })

  test('empty', () => {
    let tp = new TokenPicker([])

    expect(() => tp.token).not.toThrow()
    expect(() => tp.expire()).not.toThrow()
  })

  test('do first done', () => {
    let tokens = ['t1', 't2', 't3']
    let tp = new TokenPicker(tokens)
    let usedToken
    expect.assertions(1)
    tp.do((token, expire) => {
      usedToken = token
    })
    expect(usedToken).toBe(tp.token)
  })

  test('do second done', () => {
    let tokens = ['t1', 't2', 't3']
    let tp = new TokenPicker(tokens)
    let expired = false
    expect.assertions(2)
    tp.do((token, expire) => {
      expect(tokens).toContain(token)
      if (!expired) {
        expired = true
        expire()
      }
    })
  })

  test('do error', () => {
    let tokens = ['t1', 't2', 't3']
    let tp = new TokenPicker(tokens)

    expect.assertions(tokens.length + 1) // 最后一个是 throw
    expect(() => {
      tp.do((token, expire) => {
        expect(tokens).toContain(token)
        expire()
      })
    }).toThrowError('No available tokens')
  })

  test('do async', (done) => {
    let tokens = ['t1', 't2', 't3']
    let tp = new TokenPicker(tokens)

    expect.assertions(2)
    let expired = false
    tp.do((token, expire) => {
      expect(tokens).toContain(token)
      setTimeout(() => {
        if (!expired) {
          expired = true
          expire()
        } else {
          done()
        }
      }, 1)
    })
  })
})

describe('File', () => {
  const recordFile = path.join(fixturesDir, 'basic.json')
  const reloadFile = path.join(fixturesDir, 'reload.json')
  afterEach(() => fs.emptyDir(fixturesDir))

  test('basic', (done) => {
    basicTest(done, {recordFile})
  })

  test('second init', () => {
    let tokens = ['t1', 't2']
    let tp1 = new TokenPicker(tokens, {recordFile})
    expect(tokens).toContain(tp1.token)
    tp1.expire()

    let tp2 = new TokenPicker(tokens, {recordFile})
    expect(tokens).toContain(tp2.token)
    tp2.expire()

    expect(tp1.token).not.toBeUndefined() // tp1 没有更新，不会重复去读文件数据
    expect(tp2.token).toBeUndefined()
  })

  test('reload', () => {
    let t1 = new TokenPicker(['t1'], {recordFile: reloadFile})
    let t2 = new TokenPicker(['t2'], {recordFile: reloadFile})
    expect(t2.token).toBe('t2')
    t2.expire()
    expect(t2.token).toBeUndefined()
  })
})

function basicTest(done, opts: ITokenPickerOptions) {
  expect.assertions(5)
  let tokens = ['token1', 'token2']
  let tp = new TokenPicker(tokens, opts)

  expect(tokens).toContain(tp.token)
  tp.expire()
  expect(tokens).toContain(tp.token)

  tp.expire(Date.now() + 10)  // 设置 10 毫秒后恢复有效
  expect(tp.token).toBeUndefined()

  setTimeout(() => {
    try {
      expect(tokens).toContain(tp.token)
      tp.expire()
      expect(tp.token).toBeUndefined()
      done()
    } catch (e) {
      console.log(e)
      done()
    }
  }, 200)
}
