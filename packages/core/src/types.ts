export type Associative<T> = {[key: string]: T};
export type MappingFunction<T, U> = (value: T, index: number) => U;
export type KeyedMappingFunction<K, V, U> = (value: V, key: K, index: number) => U;