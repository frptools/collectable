import {ComparatorFn, valueOrDefault, isUndefined} from '@collectable/core';
import {Node, RedBlackTreeEntry, NONE, isNone, BRANCH} from './node';
import {PathNode, clonePath} from './path';
import {findNext} from './find';

export class RedBlackTreeIterator<K, V> implements IterableIterator<RedBlackTreeEntry<K, V>> {
  static create<K, V>(current: PathNode<K, V>, compare: ComparatorFn<K>, reversed = false): RedBlackTreeIterator<K, V> {
    if(current.isActive()) {
      current.next = reversed ? BRANCH.RIGHT : BRANCH.LEFT; // indicates the already-traversed branch
    }
    return new RedBlackTreeIterator(current, compare, reversed);
  }

  private _begun = false;

  private constructor(
    private _current: PathNode<K, V>,
    private _compare: ComparatorFn<K>,
    private _reversed: boolean
  ) {}

  private _next(reverse: boolean): IteratorResult<RedBlackTreeEntry<K, V>> {
    var current = this._current;
    var result = {done: false, value: NONE};
    if(current.isNone()) {
      result.done = true;
      return result;
    }

    if(!this._begun) {
      this._begun = true;
      result.value = current.node;
      return result;
    }

    var done = false,
        node: Node<K, V>,
        canEmit = false;

    do {
      switch(current.next) {
        case BRANCH.NONE:
          if(reverse) {
            node = current.node._right;
            current.next = BRANCH.RIGHT;
          }
          else {
            node = current.node._left;
            current.next = BRANCH.LEFT;
          }
          if(!isNone(node)) {
            current = PathNode.next(node, current, BRANCH.NONE);
          }
          break;

        case BRANCH.LEFT:
          if(reverse) {
            current = current.release();
          }
          else if(canEmit) {
            result.value = current.node;
            done = true;
          }
          else {
            node = current.node._right;
            if(isNone(node)) {
              current = current.release();
            }
            else {
              current.next = BRANCH.RIGHT;
              current = PathNode.next(node, current, BRANCH.NONE);
            }
          }
          break;

        case BRANCH.RIGHT:
          if(!reverse) {
            current = current.release();
          }
          else if(canEmit) {
            result.value = current.node;
            done = true;
          }
          else {
            node = current.node._left;
            if(isNone(node)) {
              current = current.release();
            }
            else {
              current.next = BRANCH.LEFT;
              current = PathNode.next(node, current, BRANCH.NONE);
            }
          }
          break;
      }

      if(current.isNone()) {
        result.done = true;
        result.value = NONE;
        done = true;
      }
      else {
        canEmit = true;
      }
    }
    while(!done);

    this._current = current;

    return result;
  }

  private _findNext(reverse: boolean, inclusive: boolean, key: K): IteratorResult<RedBlackTreeEntry<K, V>> {
    const result = {done: true, value: NONE};
    let current = this._current, c: number;
    if(current.isActive()) {
      if((!this._begun && (this._begun = true, c = this._compare(current.node.key, key), c = reverse ? -c : c, inclusive ? c >= 0 : c > 0)) ||
         (this._current = current = valueOrDefault(findNext(this._compare, reverse, inclusive, key, current), PathNode.NONE), current.isActive())) {
        result.done = false;
        result.value = current.node;
        current.next = reverse ? BRANCH.RIGHT : BRANCH.LEFT;
      }
    }
    return result;
  }

  next(key?: K, inclusive = true): IteratorResult<RedBlackTreeEntry<K, V>> {
    return isUndefined(key) ? this._next(this._reversed) : this._findNext(this._reversed, inclusive, key);
  }

  previous(key?: K, inclusive = true): IteratorResult<RedBlackTreeEntry<K, V>> {
    return isUndefined(key) ? this._next(!this._reversed) : this._findNext(!this._reversed, inclusive, key);
  }

  clone(): RedBlackTreeIterator<K, V> {
    return new RedBlackTreeIterator(clonePath(this._current), this._compare, this._reversed);
  }

  [Symbol.iterator](): IterableIterator<RedBlackTreeEntry<K, V>> {
    return this;
  }
}

export class RedBlackTreeKeyIterator<K, V = null> implements IterableIterator<K> {
  constructor(private _it: RedBlackTreeIterator<K, V>) {}

  next(key?: K, inclusive = true): IteratorResult<K> {
    const result: any = this._it.next(key, inclusive);
    return (result.value = result.value.key, result);
  }

  previous(key?: K, inclusive = true): IteratorResult<RedBlackTreeEntry<K, V>> {
    const result: any = this._it.previous(key, inclusive);
    return (result.value = result.value.key, result);
  }

  clone(): RedBlackTreeKeyIterator<K, V> {
    return new RedBlackTreeKeyIterator(this._it.clone());
  }

  [Symbol.iterator](): IterableIterator<K> {
    return this;
  }
}

export class RedBlackTreeValueIterator<K, V> implements IterableIterator<V> {
  constructor(private _it: RedBlackTreeIterator<K, V>) {}

  next(key?: K, inclusive = true): IteratorResult<V> {
    const result: any = this._it.next(key, inclusive);
    return (result.value = result.value.value, result);
  }

  previous(key?: K, inclusive = true): IteratorResult<RedBlackTreeEntry<K, V>> {
    const result: any = this._it.previous(key, inclusive);
    return (result.value = result.value.value, result);
  }

  clone(): RedBlackTreeValueIterator<K, V> {
    return new RedBlackTreeValueIterator(this._it.clone());
  }

  [Symbol.iterator](): IterableIterator<V> {
    return this;
  }
}
