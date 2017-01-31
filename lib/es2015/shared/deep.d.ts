import { DeepCollectionState } from '../index';
export declare function isEqual(a: any, b: any): boolean;
export declare function getDeep(collection: DeepCollectionState, path: any[]): any;
export declare function hasDeep(collection: DeepCollectionState, path: any[]): boolean;
export declare function setDeep(collection: any, path: any[], keyidx: number, value: any): DeepCollectionState;
