/**
 * 去掉注释和它紧接在注释后面的换行符（如果有的话）
 *
 * TODO: 要忽略字符串中的注释字符
 *
 * @export
 * @param {string} code
 * @returns {string}
 */
export default function(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\/\r?\n?|\/\/.*\r?\n?/g, '')
}
