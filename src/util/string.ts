export function upperFirst(str: string): string {
  return str && str[0] ? str[0].toUpperCase() + str.slice(1) : ''
}
