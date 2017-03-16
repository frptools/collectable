import {isUndefined} from '@collectable/core';
import {RedBlackTreeImpl, Comparator} from './RedBlackTree';
import {Node, NONE, BRANCH, isNone} from './node';
import {PathNode} from './path';

export function findNodeByKey<K, V>(key: K, tree: RedBlackTreeImpl<K, V>): Node<K, V>|undefined {
  var node = tree._root,
      compare = tree._compare,
      found = false;

  var loopCounter = 0; // ## DEV ##
  while(!isNone(node) && !found) {
    // ## DEV [[
    if(++loopCounter === 100) {
      throw new Error('Loop never terminated');
    }
    // ]] ##
    var c = compare(key, node.key);
    if(c === 0) {
      found = true;
    }
    else {
      node = c > 0  ? node._right : node._left;
    }
  }

  return found ? node : void 0;
}

export function findIndex<K, V>(key: K, node: Node<K, V>, compare: Comparator<K>): number {
  var found = false, i = node._left._count;

  var loopCounter = 0; // ## DEV ##
  while(!isNone(node) && !found) {
    // ## DEV [[
    if(++loopCounter === 100) {
      throw new Error('Loop never terminated');
    }
    // ]] ##
    var c = compare(key, node.key);
    if(c === 0) {
      found = true;
    }
    else if(c > 0) {
      node = node._right;
      i += node._left._count + 1;
    }
    else {
      node = node._left;
      i -= (node._right._count + 1);
    }
  }

  return found ? i : -1;
}

export function findPathToNodeByKey<K, V>(key: K, node: Node<K, V>, compare: Comparator<K>): PathNode<K, V> {
  var path = PathNode.NONE,
      found = false;

  var loopCounter = 0; // ## DEV ##
  while(!isNone(node) && !found) {
    // ## DEV [[
    if(++loopCounter === 100) {
      throw new Error('Loop never terminated');
    }
    // ]] ##
    var c = compare(key, node.key);
    path = PathNode.next(node, path, BRANCH.NONE);
    if(c === 0) {
      found = true;
    }
    else if(c > 0) {
      node = node._right;
      path.next = BRANCH.RIGHT;
    }
    else {
      node = c > 0  ? node._right : node._left;
      path.next = BRANCH.LEFT;
    }
  }

  if(!found) {
    PathNode.release(path);
    path = PathNode.NONE;
  }

  return path;
}

export function findMaxNodeLeftOfKey<K, V>(allowExactKeyMatch: boolean, key: K, tree: RedBlackTreeImpl<K, V>): Node<K, V>|undefined {
  var node = tree._root,
      compare = tree._compare,
      found = NONE,
      done = false;

  var loopCounter = 0; // ## DEV ##
  while(!isNone(node) && !done) {
    // ## DEV [[
    if(++loopCounter === 100) {
      throw new Error('Loop never terminated');
    }
    // ]] ##
    var c = compare(key, node.key);
    if(c === 0) {
      done = allowExactKeyMatch;
      if(done) {
        found = node;
      }
      else {
        node = node._left;
      }
    }
    else if(c > 0) {
      found = node;
      node = node._right;
    }
    else {
      node = node._left;
    }
  }

  return isNone(found) ? void 0 : found;
}

export function findPathToMaxNodeLeftOfKey<K, V>(allowExactKeyMatch: boolean, key: K, node: Node<K, V>, parent: PathNode<K, V>, compare: Comparator<K>): PathNode<K, V>|undefined {
  var path: PathNode<K, V>,
      found: PathNode<K, V>|undefined,
      c = compare(key, node.key);

  if(c <= 0) {
    if(c === 0 && allowExactKeyMatch) {
      return PathNode.next(node, parent, BRANCH.NONE);
    }
    if(isNone(node._left)) {
      return void 0;
    }
    path = PathNode.next(node, parent, BRANCH.LEFT);
    found = findPathToMaxNodeLeftOfKey(allowExactKeyMatch, key, node._left, path, compare);
    if(isUndefined(found)) {
      path.release();
      return void 0;
    }
    return found;
  }

  if(isNone(node._right)) {
    return PathNode.next(node, parent, BRANCH.NONE);
  }

  path = PathNode.next(node, parent, BRANCH.RIGHT);
  found = findPathToMaxNodeLeftOfKey(allowExactKeyMatch, key, node._right, path, compare);
  if(isUndefined(found)) {
    path.next = BRANCH.NONE;
    return path;
  }
  return found;
}

export function findMinNodeRightOfKey<K, V>(allowExactKeyMatch: boolean, key: K, node: Node<K, V>, compare: Comparator<K>): Node<K, V>|undefined {
  var c = compare(key, node.key);
  if(c >= 0) {
    if(c === 0 && allowExactKeyMatch) {
      return node;
    }
    if(isNone(node._right)) {
      return void 0;
    }
    return findMinNodeRightOfKey(allowExactKeyMatch, key, node._right, compare);
  }

  if(isNone(node._left)) {
    return node;
  }

  var found = findMinNodeRightOfKey(allowExactKeyMatch, key, node._left, compare);
  return isUndefined(found) ? node : found;
}

export function findPathToMinNodeRightOfKey<K, V>(allowExactKeyMatch: boolean, key: K, node: Node<K, V>, parent: PathNode<K, V>, compare: Comparator<K>): PathNode<K, V>|undefined {
  var path: PathNode<K, V>,
      found: PathNode<K, V>|undefined,
      c = compare(key, node.key);

  if(c >= 0) {
    if(c === 0 && allowExactKeyMatch) {
      return PathNode.next(node, parent, BRANCH.NONE);
    }
    if(isNone(node._right)) {
      return void 0;
    }
    path = PathNode.next(node, parent, BRANCH.RIGHT);
    found = findPathToMinNodeRightOfKey(allowExactKeyMatch, key, node._right, path, compare);
    if(isUndefined(found)) {
      path.release();
      return void 0;
    }
    return found;
  }

  if(isNone(node._left)) {
    return PathNode.next(node, parent, BRANCH.NONE);
  }

  path = PathNode.next(node, parent, BRANCH.LEFT);
  found = findPathToMinNodeRightOfKey(allowExactKeyMatch, key, node._left, path, compare);
  if(isUndefined(found)) {
    path.next = BRANCH.NONE;
    return path;
  }
  return found;
}

export function findByIndex<K, V>(index: number, tree: RedBlackTreeImpl<K, V>): Node<K, V>|undefined {
  var node = tree._root;
  var i = node._left._count;
  var loopCounter = 0; // ## DEV ##
  while(i !== index) {
    // ## DEV [[
    if(++loopCounter === 100) {
      throw new Error('Loop never terminated');
    }
    // ]] ##
    if(index < i)  {
      node = node._left;
      i -= (node._right._count + 1);
    }
    else {
      node = node._right;
      i += node._left._count + 1;
    }
  }

  return node;
}

export function findPathToIndex<K, V>(index: number, node: Node<K, V>): PathNode<K, V> {
  var path = PathNode.NONE;
  var i = node._left._count;

  var loopCounter = 0; // ## DEV ##
  while(i !== index) {
    // ## DEV [[
    if(++loopCounter === 100) {
      throw new Error('Loop never terminated');
    }
    // ]] ##
    if(index < i)  {
      path = PathNode.next(node, path, BRANCH.LEFT);
      node = node._left;
      i -= (node._right._count + 1);
    }
    else {
      path = PathNode.next(node, path, BRANCH.RIGHT);
      node = node._right;
      i += node._left._count + 1;
    }
  }
  return PathNode.next(node, path, BRANCH.NONE);
}
