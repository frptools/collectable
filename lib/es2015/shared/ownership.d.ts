export declare function nextId(): number;
export interface Batch {
    (callback: (owner?: number) => void): any;
    <T>(callback: (owner?: number) => void): T;
    start(): void;
    end(): boolean;
    readonly active: boolean;
    readonly owner: number;
}
export declare const batch: Batch;
export declare function isMutable(owner: number): boolean;
