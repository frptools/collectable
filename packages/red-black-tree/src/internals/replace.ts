import {BRANCH, Node, editable} from './node';
import {PathNode} from './path';

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
  while(p.isActive()) {
    old = p.node;
    var parent = editable(group, old);
    if(p.next === BRANCH.LEFT) {
      parent.left = node;
    }
    else {
      parent.right = node;
    }
    if(parent === old) {
      node = PathNode.release(p, node);
      p = PathNode.NONE;
    }
    else {
      node = parent;
      p = p.release();
    }
  }

  return node;
}
