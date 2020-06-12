export type Primitive = undefined | null | boolean | string | number
export interface Dict<T> {[K: string]: T}

/**
 * An object with string keys and values of type `any`.
 */
export type PlainObject = Record<string, any>

/**
 * @example
 * interface Bar {
 *  foo: string
 *  tar: number
 * }
 * Omit<Bar, 'foo'>
 */
export type Omit<O, K> = Pick<O, Exclude<keyof O, K>>


/**
 * https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c
 *
 * @example
 * SubType<{a: string, b: number}, string> => {a: string}
 */
export type SubType<O, Condition> = Pick<O, {
  [k in keyof O]: O[k] extends Condition ? k : never
}[keyof O]>


/**
 * Can change the types of properties on an object.
 * This is similar to `Merge`, except that it will not add previously non-existent properties to the object.
 * @param T the object whose properties will be overwritten
 * @param U the object who will overwrite `T`
 * @returns `T` with properties overwritten with values in `U`
 */
export type Overwrite<T extends object, U extends object> = {
  [k in keyof T]: k extends keyof U ? U[k] : T[k];
}

/**
 * 递归将一个对象中的所有 key 都设置成可选的  (数组中的对象无法继续 Partial)
 */
export type DeepPartial<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
    ? T
    : __DeepPartial<T>
export type __DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

/**
 * 递归将一个对象中的所有 key 都设置成只读的
 */
export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Array<infer U>
    ? ReadonlyArray<__DeepReadonly<U>>
    : __DeepReadonly<T>
export type __DeepReadonly<T> = {readonly [P in keyof T]: DeepReadonly<T[P]>}

/**
 * @example
 * interface Bar {
 *  foo?: string
 *  tar?: number
 * }
 * RequireKey<Bar, 'foo' | 'bar'>
 */
export type RequireKey<T, K extends keyof T> = Exclude<T, K> & {[P in K]-?: T[P]}

/**
 * keyof 的别名
 *
 * 主要是因为 keyof typeof someJsObject 不能连用，如果有此 type，就可以使用 KeyOf<typeof someJsObject> 了
 */
export type KeyOf<O> = keyof O

// ************************************
// https://github.com/andnp/SimplyTyped
// ************************************

/**
 * Gets all of the keys that are different between two objects.
 * This is a set difference between `KeyOf<T>` and `KeyOf<U>`.
 * Note that calling this with arguments reversed will have different results.
 * @param T first type from which keys will be pulled
 * @param U second type from which keys will be pulled
 * @returns keys of `T` minus the keys of `U`
 */
export type DiffKeys<T, U> = Exclude<KeyOf<T>, KeyOf<U>>

/**
 * Returns only the shared properties between two objects.
 * All shared properties must be the same type.
 * @param T the first object
 * @param U a second object whose shared properties (keys contained in both `T` and `U`) must have the same type as those in `T`
 * @returns the properties that are shared between `T` and `U`
 */
export type Intersect<T extends object, U extends Partial<T>> = Omit<U, DiffKeys<U, T>>

// *******************************************
// https://github.com/piotrwitek/utility-types
// *******************************************

// ***********************************
// https://github.com/makeflow/tslang
// ***********************************

// ***********************************
// https://github.com/pelotom/type-zoo
// ***********************************


// Extract keys

/** KeyOfValueWithType<{a: string, b: number, c: string}, string> => 'a' | 'c' */
export type KeyOfValueWithType<TObject extends object, TValue> = {
  [K in keyof TObject]: TObject[K] extends TValue ? K : never
}[keyof TObject]

/** KeyOfValueNotWithType<{a: string, b: number, c: string}, string> => 'b' */
export type KeyOfValueNotWithType<TObject extends object, TValue> = {
  [K in keyof TObject]: TObject[K] extends TValue ? never : K
}[keyof TObject]


// Extract values

/** ValueWithType<{a: '1' | '2', b: 1 | 2}, string> => '1' | '2' */
export type ValueWithType<TObject extends object, TValue> = {
  [K in keyof TObject]: TObject[K] extends TValue ? TObject[K] : never
}[keyof TObject]

/** ValueNotWithType<{a: '1' | '2', b: 1 | 2}, string> => 1 | 2 */
export type ValueNotWithType<TObject extends object, TValue> = {
  [K in keyof TObject]: TObject[K] extends TValue ? never : TObject[K]
}[keyof TObject]


// Keep or omit values by keys

/** KeepValueOfKey<{a: string, b: number}, 'a'> => {a: string} */
export type KeepValueOfKey<TObject extends object, TKey> = TObject extends object ? Pick<TObject, Extract<keyof TObject, TKey>> : never

/** KeepValueOfKey<{a: string, b: number}, 'a'> => {b: number} */
export type OmitValueOfKey<TObject extends object, TKey> = TObject extends object ? Pick<TObject, Exclude<keyof TObject, TKey>> : never


// Keep or omit values with given type

/** KeepValueWithType<{a: string, b: number, c: string}, string> => {a: string, c: string} */
export type KeepValueWithType<TObject extends object, TValue> = { [K in KeyOfValueWithType<TObject, TValue>]: TObject[K] }

/** KeepValueWithType<{a: string, b: number, c: string}, string> => {b: number} */
export type OmitValueWithType<TObject extends object, TValue> = { [K in KeyOfValueNotWithType<TObject, TValue>]: TObject[K] }
