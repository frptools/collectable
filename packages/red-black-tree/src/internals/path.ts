import {log} from '../internals/_dev'; // ## DEV ##
import {isUndefined, ComparatorFn /* ## DEV [[ */, numericCompare /* ]] ## */} from '@collectable/core';
import {RedBlackTreeStructure} from './RedBlackTree';
import {createTree} from './RedBlackTree'; // ## DEV ##
import {Node, BRANCH, NONE, isNone, editLeftChild, editRightChild /* ## DEV [[ */, checkInvalidNilAssignment /* ]] ## */} from './node';
import {setChild, updateCount} from './ops';

export class PathNode<K, V> {
  static NONE: PathNode<any, any>;
  static NO_TREE = <RedBlackTreeStructure<any, any>>createTree<any, any>(numericCompare); // ## DEV ##
  static cache: PathNode<any, any>;

  constructor(
    public node: Node<K, V>,
    public parent: PathNode<K, V>,
    public next: BRANCH
  ) {}

  static next<K, V>(node: Node<K, V>, parent: PathNode<K, V>, next: BRANCH): PathNode<K, V> {
    var p = PathNode.cache;
    if(p.isActive()) {
      PathNode.cache = p.parent;
      p.node = node;
      p.parent = parent;
      p.next = next;
    }
    else {
      p = new PathNode(node, parent, next);
    }
    return p;
  }

  static release<K, V>(p: PathNode<K, V>, node: Node<K, V> = NONE): Node<K, V> {
    do {
      p.node = NONE;
    }
    while(p.parent.isActive() && (p = p.parent, node = p.node));
    p.parent = PathNode.cache;
    return node;
  }

  static releaseAndRecount<K, V>(p: PathNode<K, V>, node: Node<K, V>): Node<K, V> {
    do {
      updateCount(p.node);
      p.node = NONE;
    }
    while(p.parent.isActive() && (p = p.parent, node = p.node));
    p.parent = PathNode.cache;
    return node;
  }

  isActive(): boolean {
    return this !== PathNode.NONE;
  }

  isNone(): boolean {
    return this === PathNode.NONE;
  }

  replace(node: Node<K, V>): void {
    if(this.parent.isActive()) {
      setChild(this.parent.next, this.parent.node, node);
    }
    this.node = node;
  }

  release(): PathNode<K, V> {
    var p = this.parent;
    log(`[PathNode#release] Now pointing at node ${p.node.key||'NIL'}`); // ## DEV ##
    this.node = NONE;
    this.parent = PathNode.cache;
    PathNode.cache = this;
    return p;
  }
}

PathNode.NONE = new PathNode<any, any>(NONE, <any>void 0, BRANCH.NONE);
PathNode.NONE.parent = PathNode.NONE;
PathNode.cache = PathNode.NONE;

export function findPath<K, V>(tree: RedBlackTreeStructure<K, V>, key: K, root: Node<K, V>, compare: ComparatorFn<K>, p?: PathNode<K, V>): PathNode<K, V> {
  var node = root; // Assumes root has already been assigned. Check for a void root before calling insert().

  if(isUndefined(p)) {
    p = PathNode.NONE;
  }

  // ## DEV [[
  var loopCounter = 0;
  // ]] ##
  do {
    var c = compare(key, node.key);
    if(c < 0) {
      log(`[findPath (#${key})] node: ${node.key} is larger -- going LEFT`); // ## DEV ##
      p = PathNode.next(node, p, BRANCH.LEFT);
      node = editLeftChild(tree, node);
      checkInvalidNilAssignment(); // ## DEV ##
    }
    else if(c > 0) {
      log(`[findPath (#${key})] node: ${node.key} is smaller -- going RIGHT`); // ## DEV ##
      p = PathNode.next(node, p, BRANCH.RIGHT);
      node = editRightChild(tree, node);
      checkInvalidNilAssignment(); // ## DEV ##
    }
    else {
      p = PathNode.next(node, p, BRANCH.NONE);
      node = NONE;
      checkInvalidNilAssignment(); // ## DEV ##
    }
    // ## DEV [[
    if(++loopCounter === 1000) {
      throw new Error(`Infinite loop in findPath() while searching for key #${key}`);
    }
    // ]] ##
  } while(!isNone(node));

  return p;
}

export function findSuccessor<K, V>(tree: RedBlackTreeStructure<K, V>, p: PathNode<K, V>): PathNode<K, V> {
  p.next = BRANCH.RIGHT;
  var node = editRightChild(tree, p.node);
  while(!isNone(node._left)) {
    p = PathNode.next(node, p, BRANCH.LEFT);
    node = editLeftChild(tree, node);
  }
  p = PathNode.next(node, p, BRANCH.NONE);
  return p;
}

export function clonePath<K, V>(path: PathNode<K, V>): PathNode<K, V> {
  let child = path = PathNode.next(path.node, path.parent, path.next), parent = child;
  while(!parent.isNone()) {
    child.parent = parent = PathNode.next(parent.node, parent.parent, parent.next);
    child = parent;
    parent = child.parent;
  }
  return path;
}