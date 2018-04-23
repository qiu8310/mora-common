/**
 *
 * Take an existing type and make each of its properties entirely optional
 *
 * @example
 *
 *   interface IPerson {
 *     name: string
 *     age: number
 *     location: string
 *   }
 *   interface IPartialPerson {
 *     name?: string
 *     age?: number
 *     location?: string
 *   }
 *   type PartialPerson = Partial<IPerson> // 等价于 IPartialPerson
 *
 */
// typescript 已经默认支持了
// export type Partial<T> = {
//     [P in keyof T]?: T[P]
// }

/** Keep types the same, but make each property to be read-only */
export type Readonly<T> = {
    readonly [P in keyof T]: T[P]
}

/** Same property names, but make the value a promise instead of a concrete one */
export type Deferred<T> = {
    [P in keyof T]: Promise<T[P]>
}

/** Wrap proxies around properties of T */
export type Proxify<T> = {
    [P in keyof T]: { get(): T[P]; set(v: T[P]): void }
}

/** 去除对象中指定的 key */
// export type Omit<O, K> = Pick<O, Exclude<keyof O, K>>  // Exclude in ts2.8

export interface Point {
    x: number
    y: number
}
