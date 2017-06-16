import warn from './warn'

const DEFAULT_MSG = 'This function will be removed in future versions.'

/**
 * @param {string} [msg] 提醒，可以不设置，有默认值
 */
function deprecated(msg?: string): any
function deprecated(target?: any, key?: string, descriptor?: PropertyDescriptor, msg = DEFAULT_MSG): any {
  if (!target || typeof target === 'string') {
    return function(...args) {
      return deprecated.apply(null, args.concat(target || DEFAULT_MSG))
    }
  }

  if (typeof descriptor.value !== 'function') {
    throw new SyntaxError('Only functions can be marked as deprecated')
  }

  return {
    ...descriptor,
    value() {
      warn(`DEPRECATED ${target.constructor.name}#${key}: ${msg}`)
      return descriptor.value.apply(this, arguments)
    }
  }
}

export default deprecated
