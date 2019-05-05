import {getProp} from './DotProp'
import {Dict} from '../type/type'

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


export const WHITE_SPACES = [
  ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
  '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
  '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
  '\u205F', '\u3000'
]

let reWords = (function() {
  let upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]'
  let lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+'

  return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g')
}())
function wrap(str: string, fn: (result: string, word: string, index: number) => string) { return words(str).reduce(fn, '') }

/**
 * Splits `string` into an array of its words.
 *
 * @example
 *
 * words('fred, barney, & pebbles')
 * // => ['fred', 'barney', 'pebbles']
 *
 * words('fred, barney, & pebbles', /[^, ]+/g)
 * // => ['fred', 'barney', '&', 'pebbles']
 */
export function words(str: string, pattern: RegExp = reWords) {
  return str.match(pattern) || []
}

/**
 * Converts the first character of `string` to upper case.
 */
export function upperFirst(str: string) {
  return str && str[0] ? str[0].toUpperCase() + str.slice(1) : ''
}

/**
 * Converts the first character of `string` to lower case.
 */
export function lowerFirst(str: string) {
  return str && str[0] ? str[0].toLowerCase() + str.slice(1) : ''
}

/**
 * Converts the first character of `string` to upper case and the remaining
 * to lower case.
 *
 * @example
 *
 * capitalize('FRED')
 * // => 'Fred'
 */
export function capitalize(str: string): string {
  return upperFirst(str.toLowerCase())
}

/**
 * Converts `string`, as space separated words, to upper case.
 *
 * @example
 *
 * upperCase('--foo-bar')
 * // => 'FOO BAR'
 *
 * upperCase('fooBar')
 * // => 'FOO BAR'
 *
 * upperCase('__foo_bar__')
 * // => 'FOO BAR'
 */
export function upperCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? ' ' : '') + word.toUpperCase())
}
/**
 * Converts `string`, as space separated words, to lower case.
 *
 * @example
 *
 * lowerCase('--Foo-Bar--')
 * // => 'foo bar'
 *
 * lowerCase('fooBar')
 * // => 'foo bar'
 *
 * lowerCase('__FOO_BAR__')
 * // => 'foo bar'
 */
export function lowerCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? ' ' : '') + word.toLowerCase())
}

/**
 * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
 *
 * @example
 *
 * startCase('--foo-bar--')
 * // => 'Foo Bar'
 *
 * startCase('fooBar')
 * // => 'Foo Bar'
 *
 * startCase('__FOO_BAR__')
 * // => 'FOO BAR'
 */
export function startCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? ' ' : '') + upperFirst(word))
}

/**
 * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
 *
 * @example
 *
 * camelCase('Foo Bar')
 * // => 'fooBar'
 *
 * camelCase('--foo-bar--')
 * // => 'fooBar'
 *
 * camelCase('__FOO_BAR__')
 * // => 'fooBar'
 */
export function camelCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? capitalize(word) : word.toLowerCase()))
}

/**
 * Converts `string` to pascal case.
 *
 * @example
 *
 * camelCase('Foo Bar')
 * // => 'FooBar'
 *
 * camelCase('--foo-bar--')
 * // => 'FooBar'
 *
 * camelCase('__FOO_BAR__')
 * // => 'FooBar'
 */
export function pascalCase(str: string) {
  return wrap(str, (result, word, index) => result + capitalize(word))
}

/**
 * Converts `string` to
 * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
 *
 * @example
 *
 * kebabCase('Foo Bar')
 * // => 'foo-bar'
 *
 * kebabCase('fooBar')
 * // => 'foo-bar'
 *
 * kebabCase('__FOO_BAR__')
 * // => 'foo-bar'
 */
export function kebabCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? '-' : '') + word.toLowerCase())
}

/**
 * Converts `string` to
 * [snake case](https://en.wikipedia.org/wiki/Snake_case).
 *
 * @example
 *
 * snakeCase('Foo Bar')
 * // => 'foo_bar'
 *
 * snakeCase('fooBar')
 * // => 'foo_bar'
 *
 * snakeCase('--FOO-BAR--')
 * // => 'foo_bar'
 */
export function snakeCase(str: string) {
  return wrap(str, (result, word, index) => result + (index ? '_' : '') + word.toLowerCase())
}

/**
 * Escapes a string for insertion into HTML.
 */
export function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
}

/**
 * Unescapes HTML special chars
 */
export function unescapeHtml(str: string) {
  return str
    .replace(/&amp;/g , '&')
    .replace(/&lt;/g  , '<')
    .replace(/&gt;/g  , '>')
    .replace(/&#0*39;/g , '\'')
    .replace(/&quot;/g, '"')
}

/**
 * Remove HTML tags from string.
 */
export function stripHtmlTags(str: string) {
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Escape RegExp string chars.
 */
export function escapeRegExp(str: string) {
  return str.replace(/\W/g, '\\$&')
}

/** reverse string */
export function reverseString(str: string) {
  return str.split('').reverse().join('')
}

/** Remove chars or white-spaces from beginning of string. */
export function ltrim(str: string, chars = WHITE_SPACES) {
  let i = -1
  let len = str.length
  while (++i < len) {
    if (!chars.includes(str[i])) break
  }
  return str.substr(i)
}

/** Remove chars or white-spaces from end of string. */
export function rtrim(str: string, chars = WHITE_SPACES) {
  return reverseString(ltrim(reverseString(str), chars))
}

/** Remove chars or white-spaces from beginning and end of string. */
export function trim(str: string, chars = WHITE_SPACES) {
  return rtrim(ltrim(str, chars), chars)
}

/**
 * Left pad string with `char` if its' length is smaller than `minLen`
 */
export function lpad(str: string, minLen: number, char = ' ') {
  let len = str.length
  return len < minLen ? char.repeat(minLen - len) + str : str
}

/**
 * Right pad string with `char` if its' length is smaller than `minLen`
 */
export function rpad(str: string, minLen: number, char = ' ') {
  let len = str.length
  return len < minLen ? str + char.repeat(minLen - len) : str
}

/**
 * Convert line-breaks from DOS/MAC to a single standard (UNIX by default)
 */
export function normalizeLineBreaks(str: string, lineEnd = '\n') {
  return str
    .replace(/\r\n/g, lineEnd) // DOS
    .replace(/\r/g, lineEnd)   // Mac
    .replace(/\n/g, lineEnd)  // Unix
}

/**
 * Convert path separator from DOS/MAC to a single standard (UNIX by default)
 */
export function normalizePathSeparator(str: string, pathSeparator = '/') {
  return str.replace(/[\\\/]/g, pathSeparator)
}

/**
 * String interpolation
 */
export function interpolate(template: string, replacements: Dict<any>, syntax = /\{\{([^\}]+)\}\}/g) {
  return template.replace(syntax, (match, prop) => {
    let v = getProp(replacements, prop)
    return v == null ? '' : v
  })
}
