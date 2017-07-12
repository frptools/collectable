import {isDefined} from '@collectable/core';
import {RedBlackTreeStructure, RedBlackTreeEntry} from '../internals';

export interface DiffTracer<K, V = null> {
  added?(entry: RedBlackTreeEntry<K, V>): boolean|void;
  removed?(entry: RedBlackTreeEntry<K, V>): boolean|void;
  retained?(before: RedBlackTreeEntry<K, V>, after: RedBlackTreeEntry<K, V>): boolean|void;
}

export function diff<T extends DiffTracer<K, V>, K, V = null>(trace: T, before: RedBlackTreeStructure<K, V>, after: RedBlackTreeStructure<K, V>): T {
  const left = before[Symbol.iterator](),
        right = after[Symbol.iterator](),
        compare = after._compare,
        traceAdd = isDefined(trace.added),
        traceRemove = isDefined(trace.removed),
        traceRetained = isDefined(trace.retained);

  if(!traceAdd && !traceRemove && !traceRetained) {
    return trace;
  }

  let leftNext = left.next();
  let left_item = leftNext.value;
  let left_done = leftNext.done;

  let rightNext = right.next();
  let right_item = rightNext.value;
  let right_done = rightNext.done;

  while(!left_done && !right_done) {
    const c = compare(left_item.key, right_item.key);

    if(c < 0) {
      if(traceRemove && trace.removed!(left_item) === false) return trace;
    }
    else if(c > 0) {
      if(traceAdd && trace.added!(right_item) === false) return trace;
    }
    else {
      if(traceRetained && trace.retained!(left_item, right_item) === false) return trace;
    }

    if(c <= 0) {
      leftNext = traceRemove ? left.next() : left.next(right_item.key);
      left_item = leftNext.value;
      left_done = leftNext.done;
    }

    if(c >= 0) {
      rightNext = traceAdd ? right.next() : right.next(left_item.key);
      right_item = rightNext.value;
      right_done = rightNext.done;
    }
  }

  if(left_done) {
    if(traceAdd) {
      while(!right_done) {
        if(trace.added!(right_item) === false) break;
        rightNext = right.next();
        right_item = rightNext.value;
        right_done = rightNext.done;
      }
    }
  }
  else if(traceRemove) {
    while(!left_done) {
      if(trace.removed!(left_item) === false) break;
      leftNext = left.next();
      left_item = leftNext.value;
      left_done = leftNext.done;
    }
  }

  return trace;
}