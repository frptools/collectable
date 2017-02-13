import {isDefined} from '@collectable/core';
import {Comparator} from './red-black-tree';
import {Node, NONE, isNone} from './node';

export const enum PATH {
  END = 0,
  LEFT = 1,
  RIGHT = 2
};

export class PathNode<K, V> {
  static cache: PathNode<any, any>|undefined = void 0;

  constructor(
    public node: Node<K, V>,
    public parent: PathNode<K, V>|undefined,
    public next: PATH
  ) {}

  static next<K, V>(node: Node<K, V>, parent: PathNode<K, V>|undefined, next: PATH): PathNode<K, V> {
    var p = PathNode.cache;
    if(isDefined(p)) {
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

  static release<K, V>(p: PathNode<K, V>, node: Node<K, V>): Node<K, V> {
    do {
      p.node = NONE;
    }
    while(isDefined(p.parent) && (p = p.parent, node = p.node));
    p.parent = PathNode.cache;
    return node;
  }

  release(): PathNode<K, V>|undefined {
    var p = this.parent;
    this.node = NONE;
    this.parent = PathNode.cache;
    PathNode.cache = this;
    return p;
  }
}

export function findPath<K, V>(key: K, value: V, root: Node<K, V>, compare: Comparator<K>): PathNode<K, V> {
  var node = root; // Assumes root has already been assigned. Check for a void root before calling insert().
  var p: PathNode<K, V>|undefined;

  do {
    var c = compare(key, node.key);
    if(c < 0) {
      p = PathNode.next(node, p, PATH.LEFT);
      node = node.left;
    }
    else if(c > 0) {
      p = PathNode.next(node, p, PATH.RIGHT);
      node = node.right;
    }
    else {
      p = PathNode.next(node, p, PATH.END);
      node = NONE;
    }
  } while(!isNone(node));

  return p;
}