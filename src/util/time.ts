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

export function debounce(fn: (...args: any[]) => void, wait: number): (...args: any[]) => void {
  let sid: NodeJS.Timer | null
  return (...args) => {
    if (sid) {
      clearTimeout(sid)
      sid = null
    }
    sid = setTimeout(() => fn(...args), wait)
  }
}

export function throttle(fn: (...args: any[]) => void, wait: number): (...args: any[]) => void {
  let lastCall: number = 0
  let sid: NodeJS.Timer | null
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

export function async(fn: (...args: any[]) => void, wait = 0): (...args: any[]) => void {
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


/**
 * 返回 Promise，可以这样使用
 *
 * ```
 * await sleep(3000)
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
