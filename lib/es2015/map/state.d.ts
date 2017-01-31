export declare class MapState<K, V> {
    values: Map<K, V>;
    owner: number;
    group: number;
    constructor(values: Map<K, V>, owner: number, group: number);
}
export declare function cloneState<K, V>(state: MapState<K, V>, mutable?: boolean): MapState<K, V>;
export declare function createState<K, V>(): MapState<K, V>;
export declare function emptyState<K, V>(): MapState<K, V>;
