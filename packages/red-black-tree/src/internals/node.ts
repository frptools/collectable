export interface Node<K, V> {
  group: number;
  key: K;
  value: V;
  red: boolean;
  left: Node<K, V>;
  right: Node<K, V>;
}

export /* ## PROD [[ const ]] ## */ enum BRANCH {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2
};

export const NONE: Node<any, any> = {
  group: 0,
  key: <any>void 0,
  value: <any>void 0,
  red: false,
  left: <any>void 0,
  right: <any>void 0
};
NONE.left = NONE;
NONE.right = NONE;

// ## DEV [[
export function checkInvalidNilAssignment() {
  if(NONE.left !== NONE) throw new Error(`Invalid assignment of ${NONE.left.key} to left child of NIL node`); // ## DEV
  if(NONE.right !== NONE) throw new Error(`Invalid assignment of ${NONE.right.key} to right child of NIL node`); // ## DEV
}
// ]] ##

export function createNode<K, V>(group: number, red: boolean, key: K, value: V): Node<K, V> {
  return {group, key, value, red, left: NONE, right: NONE};
}

export function cloneNode<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  return {
    group,
    key: node.key,
    value: node.value,
    red: node.red,
    left: node.left,
    right: node.right
  };
}

export function isNone<K, V>(node: Node<K, V>): boolean {
  return node === NONE;
}

export function editable<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  return isNone(node) || node.group === group ? node : cloneNode(group, node);
}

export function editRightChild<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  var child = node.right;
  return isNone(child) || child.group === group ? child
       : (node.right = (child = cloneNode(group, child)), child);
}

export function editLeftChild<K, V>(group: number, node: Node<K, V>): Node<K, V> {
  var child = node.left;
  return isNone(child) || child.group === group ? child
       : (node.left = (child = cloneNode(group, child)), child);
}
