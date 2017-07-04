interface PolyfillPromise<T> {
    finally(callback?: () => T): Promise<T>;
}
interface Promise<T> extends PolyfillPromise<T> {
}
interface PolyfillPromiseConstructor {
    try<T>(fn: () => T): Promise<T>;
}
interface PromiseConstructor extends PolyfillPromiseConstructor {
}
