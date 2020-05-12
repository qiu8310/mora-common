<!--

以下内容都来自： https://mp.weixin.qq.com/s/lgwS59zY4iFFBbCcyvF3CQ

-->

# 联合类型

> 将一组 keys 映射到另一组新类似，映射过程中还可以结合 filter 功能

```ts
type key = 'vue' | 'react';

type MappedType = { [k in key]: string } // { vue: string; react: string; }
```




## 生成 keys 的方法

```ts
// 1. keyof
interface Student {
  name: string;
  age: number;
}
type studentKey = keyof Student; // "name" | "age"


// 2. extract from tuple
type framework = ['vue', 'react', 'angular'];

type frameworkVal1 = framework[number]; // "vue" | "react" | "angular"
type frameworkVal2 = framework[any]; // "vue" | "react" | "angular"
```




## 那么如何实现一个操作 联合类型(Union Types) 的 map 函数呢？

```ts
type UnionTypesMap2Func<T> = T extends any ? () => T : never;  // T extends any 中可以过滤出需要的字段

type myUnionTypes = "vue" | "react" | "angular";

type myUnionTypes2FuncResult = UnionTypesMap2Func<myUnionTypes>;
// (() => "vue") | (() => "react") | (() => "angular")
```




## 类型的过滤与分流


```ts
type NeverTest = string | never // stirng
type NeverTest2 = string & never // never


//== 过滤
type Exclude<T, U> = T extends U ? never : T;


//== 分流
// 注意这里需要返回 boolean 类型
function isA(x): x is A {
  return true;
}

// 注意这里需要返回 boolean 类型
function isB(x): x is B {
  return x instanceof B;
}

function foo2(x: unknown) {
  if (isA(x)) {
    // x is A
  } else {
    // x is B
  }
}
```
