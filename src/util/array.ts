export function toArray<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item]
}

export function unique<T, K extends keyof T>(items: T[], uniqueKey?: K): T[] {
  return items.reduce((result, item) => {
    if (uniqueKey) {
      if (result.every(_ =>  _[uniqueKey] !== item[uniqueKey])) result.push(item)
    } else {
      if (result.indexOf(item) < 0) result.push(item)
    }
    return result
  }, [] as T[])
}
