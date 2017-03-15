export interface Node<K, V> {
  _group: number;
  key: K;
  value: V;
  _red: boolean;
  _left: Node<K, V>;
  _right: Node<K, V>;
  _count: number;
}

/** A read-only reference to an entry in a RedBlackTree instance. */
export type RedBlackTreeEntry<K, V> = {
  /** Read only. The hash key of this entry in the tree. */
  readonly key: K;
  /** Read/write. The value of this entry in the tree. */
  value: V;
};

export /* ## PROD [[ const ]] ## */ enum BRANCH {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2
};

export const NONE: Node<any, any> = {
  _group: 0,
  key: <any>void 0,
  value: <any>void 0,
  _red: false,
  _left: <any>void 0,
  _right: <any>void 0,
  _count: 0
};
NONE._left = NONE;
NONE._right = NONE;

// ## DEV [[
export function checkInvalidNilAssignment() {
  if(NONE._left !== NONE) throw new Error(`Invalid assignment of ${NONE._left.key} to left child of NIL node`); // ## DEV
  if(NONE._right !== NONE) throw new Error(`Invalid assignment of ${NONE._right.key} to right child of NIL node`); // ## DEV
}
// ]] ##

export function createNode<K, V>(group: number, red: boolean, key: K, value: V): Node<K, V> {
  return {_group: group, key, value, _red: red, _left: NONE, _right: NONE, _count: 1};
}

export function cloneNode<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  return {
    _group: group,
    key: node.key,
    value: node.value,
    _red: node._red,
    _left: node._left,
    _right: node._right,
    _count: node._count
  };
}

export function isNone<K, V>(node: Node<K, V>): boolean {
  return node === NONE;
}

export function editable<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  return isNone(node) || node._group === group ? node : cloneNode(group, node);
}

export function editRightChild<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  var child = node._right;
  return isNone(child) || child._group === group ? child
       : (node._right = (child = cloneNode(group, child)), child);
}

export function editLeftChild<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  var child = node._left;
  return isNone(child) || child._group === group ? child
       : (node._left = (child = cloneNode(group, child)), child);
}

export function assignValue<K, V>(value: V, node: Node<K, V>): boolean {
  const v = node.value;
  // Note the double-equals below is used to correctly compare Symbol() with Object(Symbol())
  if(v === value || (v !== null && typeof v === 'object' && v == value)) { // tslint:disable-line:triple-equals
    return false;
  }
  node.value = value;
  return true;
}
