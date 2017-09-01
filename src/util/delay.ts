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
