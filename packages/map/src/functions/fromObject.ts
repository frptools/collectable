import { ChangeFlag, commit } from '@collectable/core';
import { HashMapStructure } from '../internals/HashMap';
import { setKeyValue } from '../internals/primitives';
import { empty } from './empty';

export function fromObject<V> (object: { [key: number ]: V }): HashMapStructure<number, V>;
export function fromObject<V> (object: { [key: string ]: V }): HashMapStructure<string, V>;
export function fromObject<V> (object: any): HashMapStructure<any, V> {
  const keys = Object.keys(object);

  let map = <HashMapStructure<string, V>>empty<string, V>(true);

  for(let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const value = object[key];

    const change = ChangeFlag.get();
    setKeyValue(keys[i], value, change, map);
    change.release();
  }

  return commit(map);
}
