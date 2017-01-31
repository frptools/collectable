import { Slot } from './slot';
export declare const enum CONST {
    BRANCH_INDEX_BITCOUNT = 5,
    BRANCH_FACTOR = 32,
    BRANCH_INDEX_MASK = 31,
    MAX_OFFSET_ERROR = 2,
}
export declare const enum OFFSET_ANCHOR {
    LEFT = 0,
    RIGHT = 1,
}
export declare const enum COMMIT_MODE {
    NO_CHANGE = 0,
    RESERVE = 1,
    RELEASE = 2,
    RELEASE_DISCARD = 3,
}
export declare function invertOffset(offset: number, slotSize: number, listSize: number): number;
export declare function invertAnchor(anchor: OFFSET_ANCHOR): OFFSET_ANCHOR;
export declare function verifyIndex(size: number, index: number): number;
export declare function normalizeIndex(size: number, index: number): number;
export declare function shiftDownRoundUp(value: number, shift: number): number;
export declare function modulo(value: number, shift: number): number;
export declare function concatSlotsToNewArray<T>(left: Slot<T>[], right: Slot<T>[]): Slot<T>[];
