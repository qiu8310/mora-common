/*

  leading :  开始是否执行
  trailing:  末尾是否执行

  debounce: {
    leading: false
    trailing: true
  }

  throttle: {
    leading: true
    trailing: true
  }
 */

export function debounce(fn: (...args) => void, wait: number): (...args) => void {
  let sid
  return (...args) => {
    if (sid) {
      clearTimeout(sid)
      sid = null
    }
    sid = setTimeout(() => fn(...args), wait)
  }
}

export function throttle(fn: (...args) => void, wait: number): (...args) => void {
  let lastCall: number = 0
  let sid
  let clearSid = () => {
    if (sid) {
      clearTimeout(sid)
      sid = null
    }
  }

  return (...args) => {
    let run = () => {
      fn(...args)
      lastCall = Date.now()
    }

    clearSid()

    if (Date.now() - lastCall >= wait) {
      run()
    } else {
      // 保证 trailing 一定执行
      sid = setTimeout(run, wait)
    }
  }
}

export function async(fn: (...args) => void, wait = 0): (...args) => void {
  return (...args) => {
    setTimeout(() => fn(...args), wait)
  }
}

/**
 * 如果 wait > 0，才会异步执行 fn，否则同步执行 fn
 *
 * 上面的返回的都是函数，此方法是直接执行函数
 */
export function delay(fn: () => void, wait = 0): void {
  if (wait && wait > 0) setTimeout(fn, wait)
  else fn()
}
