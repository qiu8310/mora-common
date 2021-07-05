// 泛型继承另一个带泛型的函数
// @see https://github.com/microsoft/TypeScript/issues/30134
function identity<T>(arg: T) { return arg; }
function memoize<F extends <G>(...args: G[]) => G>(fn: F): F { return fn; }

// memid<T>(T) => T
const memid = memoize(identity);


//-----------------------------------------------------------
