import {isDefined} from '@collectable/core';
import {Comparator} from './red-black-tree';
import {Node, createNode, editable, isNone} from './node';
import {PathNode, findPath, PATH} from './path';

export function setNode<K, V>(compare: Comparator<K>, root: Node<K, V>, group: number, key: K, value: V): Node<K, V> {
  if(isNone(root)) {
    return createNode(group, key, value);
  }

  var p = findPath(key, value, root, compare);

  return p.next === PATH.END
    ? replace(group, p, value)
    : insert(group, p, key, value);
}

export function replace<K, V>(group: number, tail: PathNode<K, V>, value: V): Node<K, V> {
  var node = tail.node;
  var v = tail.node.value;
  if(v === value || (v !== null && typeof v === 'object' && v == value)) { // tslint:disable-line:triple-equals
    return node;
  }

  var old = node;
  node = editable(group, node);
  node.value = value;
  if(node === old) {
    return node;
  }

  var p = tail.release();
  while(isDefined(p)) {
    old = p.node;
    var parent = editable(group, old);
    if(p.next === PATH.LEFT) {
      parent.left = node;
    }
    else {
      parent.right = node;
    }
    if(parent === old) {
      node = PathNode.release(p, node);
      p = void 0;
    }
    else {
      node = parent;
      p = p.release();
    }
  }

  return node;
}

export function insert<K, V>(group: number, tail: PathNode<K, V>, key: K, value: V): Node<K, V> {
  const newNode = createNode(group, true, key, value);
}