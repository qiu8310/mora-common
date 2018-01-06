export function promisify<T>(func: (...args: any[]) => any): ((...args: any[]) => Promise<T>) {
  return (...args: any[]) => new Promise((resolve, reject) => {
    func(...args, (err: any, result: T) => {
      err ? reject(err) : resolve(result)
    })
  })
}
