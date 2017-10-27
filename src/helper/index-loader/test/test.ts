export * from './inc/t1'
export const test = 1

export * from './inc'
export {default as t2Fn} from './inc/t2'

console.log(JSON.stringify({
  test: '',
  t1Num: 'inc/t1',
  t1FunFromT2Default: 'inc/t2::default',
  t1FromT2Default: 'inc/t2::default',
  t1FromT3All: 'inc/t3::*',
  a11: 'inc/t2::a1',
  a22: 'inc/t2::a1',
  b1: 'inc/t2',
  b2: 'inc/t2::b1',
  c1: 'inc/t2',
  index: 'inc/',
  t2Fn: './inc/t2::default'
}, null, 2))
