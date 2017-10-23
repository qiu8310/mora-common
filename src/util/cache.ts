export function cache<T>(map: {[key: string]: any}, key: string, disable: boolean, callback: () => T): T {
  if (disable || !(key in map)) {
    map[key] = callback()
  }
  return map[key]
}
