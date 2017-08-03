---------------------------------------------------------
## in

```ts
/** Utility function to create a K:V from a list of strings */
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}
```


```ts
/** 根据上面的语法，写出了我一直想写的 elegant-api 的 ts 语法 */
interface IRouteOptions {
  [key: string]: any
}
function elegantApi<T extends string>(routes: {[x in T]: IRouteOptions}): {[y in T]: () => void} {

  return {} as any
}

const api = elegantApi({foo: {}, bar: {}})
// 然后可以开心的用 api.foo 或 api.bar 了
```

---------------------------------------------------------
## keyof

```ts
function prop<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}
```


```ts
interface Todo {
    id: number;
    text: string;
    due: Date;
}

type TodoKeys = keyof Todo;  // "id" | "text" | "due"
```

---------------------------------------------------------
## Object.entries

```ts
interface ObjectConstructor {
    // ...
    entries<T extends { [key: string]: any }, K extends keyof T>(o: T): [keyof T, T[K]][];
    // ...
}
```

---------------------------------------------------------
## Pick & Record

```ts
// From T pick a set of properties K
declare function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;

const nameAndAgeOnly = pick(person, "name", "age");  // { name: string, age: number }


// For every properties K of type T, transform it to U
function mapObject<K extends string, T, U>(obj: Record<K, T>, f: (x: T) => U): Record<K, U>

const names = { foo: "hello", bar: "world", baz: "bye" };
const lengths = mapObject(names, s => s.length);  // { foo: number, bar: number, baz: number }
```
