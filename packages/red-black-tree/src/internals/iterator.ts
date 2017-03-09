import {Node, RedBlackTreeEntry, NONE, isNone, BRANCH} from './node';
import {PathNode} from './path';

export class RedBlackTreeIterator<K, V> implements IterableIterator<RedBlackTreeEntry<K, V>> {
  private _begun = false;
  constructor(
    private _current: PathNode<K, V>,
    private _reversed = false
  ) {
    if(_current.isActive()) {
      _current.next = _reversed ? BRANCH.RIGHT : BRANCH.LEFT; // indicates the already-traversed branch
    }
  }

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
            current = PathNode.next(node, current, BRANCH.NONE /* ## DEV [[ */, current.tree /* ]] ## */);
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
              current = PathNode.next(node, current, BRANCH.NONE /* ## DEV [[ */, current.tree /* ]] ## */);
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
              current = PathNode.next(node, current, BRANCH.NONE /* ## DEV [[ */, current.tree /* ]] ## */);
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

  next(): IteratorResult<RedBlackTreeEntry<K, V>> {
    return this._next(this._reversed);
  }

  previous(): IteratorResult<RedBlackTreeEntry<K, V>> {
    return this._next(!this._reversed);
  }

  [Symbol.iterator](): IterableIterator<RedBlackTreeEntry<K, V>> {
    return this;
  }
}