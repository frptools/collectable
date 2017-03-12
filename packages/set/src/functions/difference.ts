import {HashSet, HashSetImpl, isHashSet, isIterable} from '../internals';

export function difference<T>(set: HashSet<T>, other: HashSet<T>): HashSet<T>;
export function difference<T>(set: HashSet<T>, other: T[]): HashSet<T>;
export function difference<T>(set: HashSet<T>, other: Iterable<T>): HashSet<T>;
export function difference<T>(set: HashSet<T>, other: Set<T>): HashSet<T>;
export function difference<T>(set: HashSetImpl<T>, other: HashSet<T>|T[]|Set<T>|Iterable<T>): HashSetImpl<T> {
  if(isHashSet<T>(other)) {
    return differenceHashSet(set, other);
  }

  if(Array.isArray(other)) {
    return differenceArray(set, other);
  }

  if(other && typeof other === 'object') {
    if(other instanceof Set) {
      return differenceNativeSet(set, other);
    }
    if(isIterable<T>(other)) {
      return differenceIterable<T>(set, other);
    }
  }

  return set;
}

function differenceHashSet<T>(set: HashSetImpl<T>, other: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function differenceArray<T>(set: HashSetImpl<T>, other: T[]): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function differenceNativeSet<T>(set: HashSetImpl<T>, other: Set<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function differenceIterable<T>(set: HashSetImpl<T>, other: Iterable<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}
