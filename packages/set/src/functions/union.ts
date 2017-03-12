import {HashSet, HashSetImpl, isHashSet, isIterable} from '../internals';

export function union<T>(set: HashSet<T>, other: HashSet<T>): HashSet<T>;
export function union<T>(set: HashSet<T>, other: T[]): HashSet<T>;
export function union<T>(set: HashSet<T>, other: Iterable<T>): HashSet<T>;
export function union<T>(set: HashSet<T>, other: Set<T>): HashSet<T>;
export function union<T>(set: HashSetImpl<T>, other: HashSet<T>|T[]|Set<T>|Iterable<T>): HashSetImpl<T> {
  if(isHashSet<T>(other)) {
    return unionHashSet(set, other);
  }

  if(Array.isArray(other)) {
    return unionArray(set, other);
  }

  if(other && typeof other === 'object') {
    if(other instanceof Set) {
      return unionNativeSet(set, other);
    }
    if(isIterable<T>(other)) {
      return unionIterable<T>(set, other);
    }
  }

  return set;
}

function unionHashSet<T>(set: HashSetImpl<T>, other: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function unionArray<T>(set: HashSetImpl<T>, other: T[]): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function unionNativeSet<T>(set: HashSetImpl<T>, other: Set<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function unionIterable<T>(set: HashSetImpl<T>, other: Iterable<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}
