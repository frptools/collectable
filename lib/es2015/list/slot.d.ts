import { COMMIT_MODE } from './common';
export declare type ChildSlotOutParams<T> = {
    slot: T | Slot<T>;
    index: number;
    offset: number;
};
export declare class Slot<T> {
    group: number;
    size: number;
    sum: number;
    recompute: number;
    subcount: number;
    slots: (Slot<T> | T)[];
    constructor(group: number, size: number, sum: number, recompute: number, subcount: number, slots: (Slot<T> | T)[]);
    static empty<T>(): Slot<T>;
    shallowClone(mode: COMMIT_MODE): Slot<T>;
    shallowCloneToGroup(group: number, preserveStatus?: boolean): Slot<T>;
    cloneToGroup(group: number, preserveStatus?: boolean): Slot<T>;
    toReservedNode(group: number): Slot<T>;
    cloneAsPlaceholder(group: number): Slot<T>;
    cloneWithAdjustedRange(group: number, padLeft: number, padRight: number, isLeaf: boolean, preserveStatus?: boolean): Slot<T>;
    adjustRange(padLeft: number, padRight: number, isLeaf: boolean): void;
    createParent(group: number, mode: COMMIT_MODE, expand?: ExpansionParameters): Slot<T>;
    isReserved(): boolean;
    isReservedFor(group: number): boolean;
    isRelaxed(): boolean;
    isEditable(group: number): boolean;
    calculateRecompute(slotCountDelta: number): number;
    isSubtreeFull(shift: number): boolean;
    prepareForRelease(currentGroup: number): Slot<T>;
    updatePlaceholder(actual: Slot<T>): void;
    reserveChildAtIndex(slotIndex: number): Slot<T>;
    resolveChild(ordinal: number, shift: number, out: ChildSlotOutParams<T>): boolean;
}
export declare class ExpansionParameters {
    private static _default;
    padLeft: number;
    padRight: number;
    sizeDelta: number;
    private constructor();
    static get(padLeft: number, padRight: number, sizeDelta: number): ExpansionParameters;
}
export declare var emptySlot: Slot<any>;
