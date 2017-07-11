import {HashMapStructure} from '../HashMap';
import {NodeType} from '../nodes';

export function fold<K, V, R>(
  f: (accum: R, value: V, key: K, index: number) => R,
  seed: R,
  map: HashMapStructure<K, V>,
  cancelOnFalse = false): R {

  const node = map._root;

  if(node.type === NodeType.EMPTY) {
    return seed;
  }

  if(node.type === NodeType.LEAF) {
    return f(seed, node.value, node.key, 0);
  }

  const nodesToVisit = [node.children];

  let children, index = 0;

  while((!cancelOnFalse || <any>seed !== false) && (children = nodesToVisit.shift())) {
    for(let i = 0; i < children.length && (!cancelOnFalse || <any>seed !== false); ++i) {
      const child = children[i];

      if(!child) continue;

      if(child.type === NodeType.EMPTY) {
        continue;
      }
      else if(child.type === NodeType.LEAF) {
        seed = f(seed, child.value, child.key, index++);
      }
      else {
        nodesToVisit.push(child.children);
      }
    }
  }

  return seed;
}
