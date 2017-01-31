import { ListState } from './state';
export declare function setValueAtOrdinal<T>(state: ListState<T>, ordinal: number, value: T): void;
export declare function appendValues<T>(state: ListState<T>, values: T[]): ListState<T>;
export declare function prependValues<T>(state: ListState<T>, values: T[]): ListState<T>;
export declare function insertValues<T>(state: ListState<T>, ordinal: number, values: T[]): ListState<T>;
export declare function deleteValues<T>(state: ListState<T>, start: number, end: number): ListState<T>;
export declare class ListIterator<T> implements IterableIterator<T> {
    private _state;
    private _index;
    constructor(_state: ListState<T>);
    next(): IteratorResult<T>;
    [Symbol.iterator](): IterableIterator<T>;
}
export declare function createIterator<T>(state: ListState<T>): IterableIterator<T>;
export declare function createArray<T>(state: ListState<T>): T[];
