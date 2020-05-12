// 内容来自： https://mp.weixin.qq.com/s/lgwS59zY4iFFBbCcyvF3CQ


// 这里定义一个工具类型，简化代码
type ReplaceValByOwnKey<T, S extends any> = { [P in keyof T]: S[P] };

// shift action
type ShiftAction<T extends any[]> = ((...args: T) => any) extends ((arg1: any, ...rest: infer R) => any) ? R : never;

// unshift action
type UnshiftAction<T extends any[], A> = ((args1: A, ...rest: T) => any) extends ((...args: infer R) => any) ? R : never;

// pop action
type PopAction<T extends any[]> = ReplaceValByOwnKey<ShiftAction<T>, T>;

// push action
type PushAction<T extends any[], E> = ReplaceValByOwnKey<UnshiftAction<T, any>, T & { [k: string]: E }>;

// test ...
type tuple = ['vue', 'react', 'angular'];

type resultWithShiftAction = ShiftAction<tuple>; // ["react", "angular"]
type resultWithUnshiftAction = UnshiftAction<tuple, 'jquery'>; // ["jquery", "vue", "react", "angular"]
type resultWithPopAction = PopAction<tuple>; // ["vue", "react"]
type resultWithPushAction = PushAction<tuple, 'jquery'>; // ["vue", "react", "angular", "jquery"]


// 「注意」：这里的代码仅用于测试，操作某些复杂类型可能会报错，需要做进一步兼容处理，这里简化了相关代码，请勿用于生产环境！
