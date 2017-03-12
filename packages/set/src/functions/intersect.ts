import {HashSet, HashSetImpl, isHashSet, isIterable} from '../internals';

export function intersect<T>(set: HashSet<T>, other: HashSet<T>): HashSet<T>;
export function intersect<T>(set: HashSet<T>, other: T[]): HashSet<T>;
export function intersect<T>(set: HashSet<T>, other: Iterable<T>): HashSet<T>;
export function intersect<T>(set: HashSet<T>, other: Set<T>): HashSet<T>;
export function intersect<T>(set: HashSetImpl<T>, other: HashSet<T>|T[]|Set<T>|Iterable<T>): HashSetImpl<T> {
  if(isHashSet<T>(other)) {
    return intersectHashSet(set, other);
  }

  if(Array.isArray(other)) {
    return intersectArray(set, other);
  }

  if(other && typeof other === 'object') {
    if(other instanceof Set) {
      return intersectNativeSet(set, other);
    }
    if(isIterable<T>(other)) {
      return intersectIterable<T>(set, other);
    }
  }

  return set;
}

function intersectHashSet<T>(set: HashSetImpl<T>, other: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function intersectArray<T>(set: HashSetImpl<T>, other: T[]): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function intersectNativeSet<T>(set: HashSetImpl<T>, other: Set<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}

function intersectIterable<T>(set: HashSetImpl<T>, other: Iterable<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}
