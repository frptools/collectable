import {Leaf, AnyNode, NodeType} from '../nodes';

export function iterator<K, V, R>(
  node: AnyNode<K, V>,
  f: (leaf: Leaf<K, V>) => R): IterableIterator<R> {

  return new HashMapIterator<R>(lazyVisit(node, f, []));
}

export function identity<T>(x: T): T {
  return x;
}

class HashMapIterator<R> implements IterableIterator<R> {
  constructor(private _iterate: { value: R, rest: Array<any> }) { }

  public next(): IteratorResult<R> {
    if(!this._iterate) {
      return {done: true, value: null} as any as IteratorResult<R>;
    }

    const {value, rest} = this._iterate;

    this._iterate = continuation(rest);

    return {done: false, value};
  }

  public [Symbol.iterator]() {
    return this;
  }
}

const continuation = (k: Array<any>): any =>
  k && lazyVisitChildren(k[0], k[1], k[2], k[3], k[4]);

function lazyVisit <K, V, R>(node: AnyNode<K, V>, f: (leaf: Leaf<K, V>) => R, k: Array<any>): any {
  switch (node.type) {
    case NodeType.LEAF:
      return {value: f(node), rest: k};

    case NodeType.COLLISION:
    case NodeType.ARRAY:
    case NodeType.INDEX:
      const children = node.children;
      return lazyVisitChildren(children.length, children, 0, f, k);

    default:
      return continuation(k);
  }
}

function lazyVisitChildren<K, V, R>(
  length: number,
  children: Array<AnyNode<K, V>>,
  index: number,
  f: (leaf: Leaf<K, V>) => R,
  k: Array<any>): { value: R, rest: Array<any> } {

  while(index < length) {
    const child = children[index++];
    if(child && notEmptyNode(child)) {
      return lazyVisit(child, f, [length, children, index, f, k]);
    }
  }

  return continuation(k);
}

function notEmptyNode<K, V>(node: AnyNode<K, V>): boolean {
  return node && node.type !== NodeType.EMPTY;
}
