import {getOwner, getGroup} from '@collectable/core';
import {SortedSet, isFrozen, fromArray as _fromArray} from '../src';

export function snapshot<T>(set: SortedSet<T>): object {
  return {
    owner: getOwner(set),
    group: getGroup(set),
    frozen: isFrozen(set),
    values: Array.from(set)
  };
}

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function compareNumbers(a: number, b: number): number {
  return a - b;
}

export function fromStringArray(values: string[]): SortedSet<string> {
  return _fromArray(values, compareStrings);
}

export function fromNumericArray(values: number[]): SortedSet<number> {
  return _fromArray(values, compareNumbers);
}