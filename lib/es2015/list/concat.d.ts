import { Slot } from './slot';
import { ListState } from './state';
export declare function concatLists<T>(leftState: ListState<T>, rightState: ListState<T>): ListState<T>;
export declare function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean, lists?: any): boolean;
export declare function calculateExtraSearchSteps(upperSlots: number, lowerSlots: number): number;
export declare function calculateRebalancedSlotCount(upperSlots: number, lowerSlots: number): number;
