export interface Iterable<T> {
    [Symbol.iterator](): IterableIterator<T | undefined>;
    toJS(): any;
}
export declare function isIterable<T>(value: any): value is Iterable<T>;
