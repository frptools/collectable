import { Iterable } from '../shared/common';
export declare type PSetFunction<T> = (map: PersistentSet<T>) => PersistentSet<T> | void;
export interface PSetState<T> {
    set: Set<T>;
    owner: number;
    group: number;
}
export declare class PersistentSet<T> implements Iterable<T> {
    private _state;
    private static _empty;
    static create(create?: PSetFunction<any>): PersistentSet<any>;
    static create<T>(create?: PSetFunction<T>): PersistentSet<T>;
    static empty<T>(): PersistentSet<T>;
    constructor(state: PSetState<T>);
    private prep();
    readonly size: number;
    readonly mutable: boolean;
    batch(callback: PSetFunction<T>): PersistentSet<T>;
    asMutable(): PersistentSet<T>;
    asImmutable(): PersistentSet<T>;
    clone(): PersistentSet<T>;
    add(value: T): PersistentSet<T>;
    remove(value: T): PersistentSet<T>;
    has(value: T): boolean;
    toArray(): T[];
    values(): IterableIterator<T>;
    [Symbol.iterator](): IterableIterator<T>;
    private _serializing;
    toJS(): T[];
}
