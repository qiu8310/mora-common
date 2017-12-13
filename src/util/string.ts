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
