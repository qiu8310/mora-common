// https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md
export function getPrototypeOf(obj: any): any {
  return Object.getPrototypeOf ? Object.getPrototypeOf(obj) : obj.__proto__
}
