import {HashSet, HashSetImpl, isHashSet, isIterable} from '../internals';

export function subtract<T>(set: HashSet<T>, other: HashSet<T>): HashSet<T>;
export function subtract<T>(set: HashSet<T>, other: T[]): HashSet<T>;
export function subtract<T>(set: HashSet<T>, other: Iterable<T>): HashSet<T>;
export function subtract<T>(set: HashSet<T>, other: Set<T>): HashSet<T>;
export function subtract<T>(set: HashSetImpl<T>, other: HashSet<T>|T[]|Set<T>|Iterable<T>): HashSetImpl<T> {
  if(isHashSet<T>(other)) {
    return subtractHashSet(set, other);
  }

  if(Array.isArray(other)) {
    return subtractArray(set, other);
  }

  if(other && typeof other === 'object') {
    if(other instanceof Set) {
      return subtractNativeSet(set, other);
    }
    if(isIterable<T>(other)) {
      return subtractIterable<T>(set, other);
    }
  }

  return set;
}

function subtractHashSet<T>(set: HashSetImpl<T>, other: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function subtractArray<T>(set: HashSetImpl<T>, other: T[]): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function subtractNativeSet<T>(set: HashSetImpl<T>, other: Set<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function subtractIterable<T>(set: HashSetImpl<T>, other: Iterable<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}
