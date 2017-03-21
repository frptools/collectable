import {getOwner, getGroup} from '@collectable/core';
import {SortedMap as _SortedMap, SortedMapEntry, isFrozen, fromArray as _fromArray} from '../src';

export function snapshot(map: SortedMap): object {
  return {
    owner: getOwner(map),
    group: getGroup(map),
    frozen: isFrozen(map),
    values: Array.from(map)
  };
}

export type SortedMap = _SortedMap<any, any>;

export function pairsFrom(array: number[]): [number, string][];
export function pairsFrom(array: string[]): [string, number][];
export function pairsFrom(array: string[]|number[]): [string|number, string|number][] {
  if(array.length === 0) return [];
  return typeof array[0] === 'string'
    ? (<string[]>array).map((s: string) => (<[string, number]>[s, s.charCodeAt(0)]))
    : (<number[]>array).map((n: number) => (<[number, string]>[n, `#${n}`]));
}

type Entry<K, V> = SortedMapEntry<K, V, undefined>;
function compareStrings(a: Entry<string, number>, b: Entry<string, number>): number {
  return a.key.localeCompare(b.key);
}

function compareNumbers(a: Entry<number, string>, b: Entry<number, string>): number {
  return a.key - b.key;
}

export function fromStringArray(values: string[]): SortedMap {
  return _fromArray(pairsFrom(values), compareStrings);
}

export function fromNumericArray(values: number[]): SortedMap {
  return _fromArray(pairsFrom(values), compareNumbers);
}