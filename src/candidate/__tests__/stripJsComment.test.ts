import {stripJsComment} from '../stripJsComment'

test('strip single line comment', () => {
  expect(stripJsComment(`
foo
// comment
bar
  `)).toBe(`
foo
bar
  `)
})

test('strip multiple line comment', () => {
  expect(stripJsComment(`
abc
/*
foo bar
asfas ads
*/
  `)).toBe(`
abc
  `)

  expect(stripJsComment(`
abc
/* foo bar */ dd
  `)).toBe(`
abc
 dd
  `)
})
