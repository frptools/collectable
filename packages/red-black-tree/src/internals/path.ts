import { ComparatorFn, isUndefined } from '@collectable/core';
import { RedBlackTreeStructure } from './RedBlackTree';
import { BRANCH, NONE, Node, editLeftChild, editRightChild, isNone } from './node';
import { setChild, updateCount } from './ops';

export class PathNode<K, V> {
  static NONE: PathNode<any, any>;
  static cache: PathNode<any, any>;

  constructor (
    public node: Node<K, V>,
    public parent: PathNode<K, V>,
    public next: BRANCH
  ) {}

  static next<K, V> (node: Node<K, V>, parent: PathNode<K, V>, next: BRANCH): PathNode<K, V> {
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

  static release<K, V> (p: PathNode<K, V>, node?: Node<K, V>): Node<K, V> {
    if (isUndefined(node)) {
      node = NONE;
    }
    do {
      p.node = NONE;
    }
    while(p.parent.isActive() && (p = p.parent, node = p.node));
    p.parent = PathNode.cache;
    return node;
  }

  static releaseAndRecount<K, V> (p: PathNode<K, V>, node: Node<K, V>): Node<K, V> {
    do {
      updateCount(p.node);
      p.node = NONE;
    }
    while(p.parent.isActive() && (p = p.parent, node = p.node));
    p.parent = PathNode.cache;
    return node;
  }

  isActive (): boolean {
    return this !== PathNode.NONE;
  }

  isNone (): boolean {
    return this === PathNode.NONE;
  }

  replace (node: Node<K, V>): void {
    if(this.parent.isActive()) {
      setChild(this.parent.next, this.parent.node, node);
    }
    this.node = node;
  }

  release (): PathNode<K, V> {
    var p = this.parent;
    this.node = NONE;
    this.next = BRANCH.NONE;
    this.parent = PathNode.cache;
    PathNode.cache = this;
    return p;
  }
}

PathNode.NONE = new PathNode<any, any>(NONE, <any>void 0, BRANCH.NONE);
PathNode.NONE.parent = PathNode.NONE;
PathNode.cache = PathNode.NONE;

export function findPath<K, V> (tree: RedBlackTreeStructure<K, V>, key: K, root: Node<K, V>, compare: ComparatorFn<K>, p?: PathNode<K, V>): PathNode<K, V> {
  var node = root; // Assumes root has already been assigned. Check for a void root before calling insert().

  if(isUndefined(p)) {
    p = PathNode.NONE;
  }

  do {
    var c = compare(key, node.key);
    if(c < 0) {
      p = PathNode.next(node, p, BRANCH.LEFT);
      node = editLeftChild(tree, node);
    }
    else if(c > 0) {
      p = PathNode.next(node, p, BRANCH.RIGHT);
      node = editRightChild(tree, node);
    }
    else {
      p = PathNode.next(node, p, BRANCH.NONE);
      node = NONE;
    }
  } while(!isNone(node));

  return p;
}

export function findSuccessor<K, V> (tree: RedBlackTreeStructure<K, V>, p: PathNode<K, V>): PathNode<K, V> {
  p.next = BRANCH.RIGHT;
  var node = editRightChild(tree, p.node);
  while(!isNone(node._left)) {
    p = PathNode.next(node, p, BRANCH.LEFT);
    node = editLeftChild(tree, node);
  }
  p = PathNode.next(node, p, BRANCH.NONE);
  return p;
}

export function clonePath<K, V> (path: PathNode<K, V>): PathNode<K, V> {
  let child = path = PathNode.next(path.node, path.parent, path.next), parent = child;
  while(!parent.isNone()) {
    child.parent = parent = PathNode.next(parent.node, parent.parent, parent.next);
    child = parent;
    parent = child.parent;
  }
  return path;
}