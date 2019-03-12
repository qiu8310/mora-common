import {toString, hasOwnProp, isObjectLike} from './object'

const MAX_SAFE_INTEGER = 9007199254740991

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * isEmpty(null)
 * // => true
 *
 * isEmpty(true)
 * // => true
 *
 * isEmpty(1)
 * // => true
 *
 * isEmpty([1, 2, 3])
 * // => false
 *
 * isEmpty('abc')
 * // => false
 *
 * isEmpty({ 'a': 1 })
 * // => false
 */
export function isEmpty(value: any) {
  if (value == null) {
    return true
  }

  if (isArrayLike(value) && (Array.isArray(value) || typeof value === 'string' || typeof value.splice === 'function' || isArguments(value))) {
    return !value.length
  }

  let tag = toString(value)
  if (tag === '[object Map]' || tag === '[object Set]') {
    return !value.size
  }

  for (const key in value) {
    if (hasOwnProp(value, key)) {
      return false
    }
  }

  return true
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) || value instanceof Number
}

export function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String
}

export function isNil(value: any): value is (undefined | null) {
  return typeof value === 'undefined' || value === null
}

export function isTruthy(value: any) {
  return !!value
}

export function isFalsy(value: any) {
  return !value
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object, else `false`.
 * @example
 *
 * isArguments(function() { return arguments }())
 * // => true
 *
 * isArguments([1, 2, 3])
 * // => false
 */
export function isArguments(value: any) {
  return isObjectLike(value) && toString(value) === '[object Arguments]'
}


/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * isArrayLike([1, 2, 3])
 * // => true
 *
 * isArrayLike(document.body.children)
 * // => true
 *
 * isArrayLike('abc')
 * // => true
 *
 * isArrayLike(Function)
 * // => false
 */
export function isArrayLike(value: any) {
  return value != null && typeof value !== 'function' && isLength(value.length)
}


/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * isLength(3)
 * // => true
 *
 * isLength(Number.MIN_VALUE)
 * // => false
 *
 * isLength(Infinity)
 * // => false
 *
 * isLength('3')
 * // => false
 */
export function isLength(value: any) {
  return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER
}
