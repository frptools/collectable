import {getOwner, getGroup} from '@collectable/core';
import {Set, isFrozen} from '../src';

export function snapshot<T>(set: Set<T>): object {
  return {
    owner: getOwner(set),
    group: getGroup(set),
    frozen: isFrozen(set),
    values: Array.from(set)
  };
}