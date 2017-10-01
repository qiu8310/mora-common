// https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md
export function getPrototypeOf(obj: any): any {
  return obj.__proto__ || /* istanbul ignore next */ Object.getPrototypeOf(obj)
}
