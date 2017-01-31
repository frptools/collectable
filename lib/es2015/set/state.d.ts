export declare class SetState<T> {
    values: Set<T>;
    owner: number;
    group: number;
    constructor(values: Set<T>, owner: number, group: number);
}
export declare function cloneState<T>(state: SetState<T>, mutable?: boolean): SetState<T>;
export declare function createState<T>(values?: T[] | Iterable<T>): SetState<T>;
export declare function emptyState<T>(): SetState<T>;
