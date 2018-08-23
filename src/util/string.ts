/**
 * 将字符串的首字母大写
 */
export function capitalize(str: string): string {
  return str && str[0] ? str[0].toUpperCase() + str.slice(1) : ''
}

/**
 * Anagrams of string (with duplicates)
 *
 * Use recursion. For each letter in the given string, create all the partial
 * anagrams for the rest of its letters. Use map() to combine the letter with
 * each partial anagram, then reduce() to combine all anagrams in one array.
 * Base cases are for string length equal to 2 or 1
 *
 * @example
 *
 * anagrams('abc') -> ['abc','acb','bac','bca','cab','cba']
 */
export function anagrams(str: string) {
  if (str.length <= 2)  return str.length === 2 ? [str, str[1] + str[0]] : [str]
  return str.split('').reduce( (acc, letter, i) => {
    anagrams(str.slice(0, i) + str.slice(i + 1)).map( val => acc.push(letter + val) )
    return acc
  }, [] as string[])
}


/** Used to match words to create compound words. */
const reWords = (function() {
  const upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]'
  const lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+'

  return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g')
}())

function wrap(str: string, fn: (result: string, word: string, index: number) => string) {
  let mat = str.match(reWords)
  return mat ? mat.reduce(fn, '') : ''
}

/**
 * "hello world" => "helloWorld"
 */
export function camelCase(str: string) {
  return wrap(str, (result, word, index) => result + word.charAt(0)[index ? 'toUpperCase' : 'toLowerCase']() + word.slice(1))
}

/**
 * "hello world" => "HelloWorld"
 */
export function capCamelCase(str: string) {
  return wrap(str, (result, word, index) => result + word.charAt(0).toUpperCase() + word.slice(1))
}

/**
 * "hello world" => "HELLO_WORLD"
 */
export function upperCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? '_' : '') + word.toUpperCase())
}

/**
 * "hello world" => "hello-world"
 */
export function kebabCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? '-' : '') + word.toLowerCase())
}

/**
 * "hello world" => "hello_world"
 */
export function snakeCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? '_' : '') + word.toLowerCase())
}
