export function promisify<T>(func: (...args: any[]) => any, context?: any): ((...args: any[]) => Promise<T>) {
  return (...args: any[]) => new Promise((resolve, reject) => {
    func.call(context, ...args, (err: any, result: T) => {
      err ? reject(err) : resolve(result)
    })
  })
}
