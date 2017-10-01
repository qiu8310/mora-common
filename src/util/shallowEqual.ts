/**
 * 判断两个对象是会浅相等（对象中的引用相等即可，值相等不一定引用相等）
 *
 * @export
 * @param {Object} objA - 对象 A
 * @param {Object} objB - 对象 B
 * @returns {boolean} - 是否浅相等
 */
export function shallowEqual(objA: Object, objB: Object): boolean {
  if (objA === objB) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  let keysA = Object.keys(objA)
  let keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  let bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB)
  for (let key of keysA) {
    if (!bHasOwnProperty(key) || objA[key] !== objB[key]) return false
  }
  return true
}
