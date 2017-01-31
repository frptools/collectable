import { ListState } from './state';
export declare class Collector<T> {
    private static _default;
    static default<T>(count: number, prepend: boolean): Collector<any>;
    static one<T>(elements: T[]): Collector<T>;
    elements: Array<T[]>;
    index: number;
    marker: number;
    private constructor();
    set(elements: T[]): void;
    mark(): void;
    restore(): void;
    populate(values: T[], innerIndex: number): void;
}
export declare function increaseCapacity<T>(state: ListState<T>, increaseBy: number, prepend: boolean): Collector<T>;
