export function cache<T>(map: {[key: string]: T}, key: string, disable: boolean, callback: () => T): T {
  // 不能这样写，一定要存到 map 中，有可能其它程序需要读取
  // if (disable) return callback()
  if (disable || !(key in map)) {
    map[key] = callback()
  }
  return map[key]
}
