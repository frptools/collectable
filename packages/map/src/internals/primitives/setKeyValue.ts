import {ChangeFlag, isUndefined, hash as _hash} from '@collectable/core';
import {AnyNode} from '../nodes';
import {HashMapStructure} from '../HashMap';
import {NOTHING} from '../nodes/constants';

const constant = <T>(x: T) => () => x;

export function setKeyValue<K, V>(
  key: K,
  value: V,
  change: ChangeFlag,
  map: HashMapStructure<K, V>): HashMapStructure<K, V> {

  if(isUndefined(value)) {
    value = NOTHING as V;
  }

  const hash: number = _hash(key);
  const newNode: AnyNode<K, V> = map._root.modify(map, change, 0, constant(value), hash, key);

  // ## DEV [[
  if(newNode !== map._root && !change.confirmed) {
    throw new Error('Investigate how the root managed to change without the change flag being set');
  }
  // ]] ##

  if(change.confirmed) {
    map._root = newNode;
    map._size += change.delta;
  }

  return map;
}
