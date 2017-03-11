import {HashMapImpl} from '../HashMap';
import {NodeType} from '../nodes';

export function fold<K, V, R>(
  f: (accum: R, value: V, key?: K) => R,
  seed: R,
  map: HashMapImpl<K, V>): R {

  const node = map._root;

  if(node.type === NodeType.EMPTY) {
    return seed;
  }

  if(node.type === NodeType.LEAF) {
    return f(seed, node.value, node.key);
  }

  const nodesToVisit = [node.children];

  let children;

  while(children = nodesToVisit.shift()) {
    for(let i = 0; i < children.length; ++i) {
      const child = children[i];

      if(!child) continue;

      if(child.type === NodeType.EMPTY) {
        continue;
      }
      else if(child.type === NodeType.LEAF) {
        seed = f(seed, child.value, child.key);
      }
      else {
        nodesToVisit.push(child.children);
      }
    }
  }

  return seed;
}
