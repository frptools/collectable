import { OFFSET_ANCHOR } from './common';
import { View } from './view';
export declare class ListState<T> {
    group: number;
    owner: number;
    size: number;
    lastWrite: OFFSET_ANCHOR;
    left: View<T>;
    right: View<T>;
    constructor(group: number, owner: number, size: number, lastWrite: OFFSET_ANCHOR, left: View<T>, right: View<T>);
}
export declare function cloneState<T>(state: ListState<T>, group: number, mutable: boolean): ListState<T>;
export declare function ensureMutable<T>(state: ListState<T>): ListState<T>;
export declare function ensureImmutable<T>(state: ListState<T>, done: boolean): ListState<T>;
export declare function getView<T>(state: ListState<T>, anchor: OFFSET_ANCHOR, asWriteTarget: boolean, preferredOrdinal?: number): View<T>;
export declare function getOtherView<T>(state: ListState<T>, anchor: OFFSET_ANCHOR): View<T>;
export declare function setView<T>(state: ListState<T>, view: View<T>): void;
export declare function emptyState<T>(mutable: boolean): ListState<T>;
