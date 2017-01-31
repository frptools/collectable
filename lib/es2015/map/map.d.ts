import { Iterable } from '../shared/common';
import { MapState } from './state';
export declare type MapCallback<K, V> = (map: PersistentMap<K, V>) => PersistentMap<K, V> | void;
export declare type UpdateCallback<V> = (value: V | undefined) => V;
export declare class PersistentMap<K, V> implements Iterable<[K, V]> {
    private static _empty;
    static create(create?: MapCallback<any, any>): PersistentMap<any, any>;
    static create<K, V>(create?: MapCallback<K, V>): PersistentMap<K, V>;
    static empty(): PersistentMap<any, any>;
    static empty<K, V>(): PersistentMap<K, V>;
    private _state;
    constructor(state: MapState<K, V>);
    private prep();
    readonly size: number;
    readonly mutable: boolean;
    batch(callback: MapCallback<K, V>): PersistentMap<K, V>;
    asMutable(): PersistentMap<K, V>;
    asImmutable(): PersistentMap<K, V>;
    update(key: K, callback: UpdateCallback<V>): PersistentMap<K, V>;
    clone(): PersistentMap<K, V>;
    get(key: K): V | undefined;
    getIn(path: any[]): any | undefined;
    set(key: K, value: V): PersistentMap<K, V>;
    setIn(path: any[], value: any): PersistentMap<K, V>;
    has(key: K): boolean;
    hasIn(path: any[]): boolean;
    delete(key: K): PersistentMap<K, V>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    private _serializing;
    toJS(): {
        [key: string]: any;
    };
}
