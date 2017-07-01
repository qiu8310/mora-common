import stripComment from '../stripJsComment'

test('strip single line comment', () => {
  expect(stripComment(`
foo
// comment
bar
  `)).toBe(`
foo
bar
  `)
})

test('strip multiple line comment', () => {
  expect(stripComment(`
abc
/*
foo bar
asfas ads
*/
  `)).toBe(`
abc
  `)

  expect(stripComment(`
abc
/* foo bar */ dd
  `)).toBe(`
abc
 dd
  `)
})
