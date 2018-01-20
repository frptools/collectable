import { unwrap } from '@collectable/core';
import { RedBlackTreeStructure, fromObject } from '@collectable/red-black-tree';
import test from 'ava';
import { SortedSetStructure as SortedSet, empty, fromArray } from '../../src';
import { fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let set: SortedSet<string>, set1: SortedSet<any>;
let map1: RedBlackTreeStructure<any, any>, map2: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  set = fromStringArray(values);
  map1 = fromObject<string>(values);
  map2 = fromObject<string>(values);
  set1 = fromArray([map1, map2]);
});

test('returns an empty array if the set is empty', t => {
  t.is(unwrap<string[]>(empty<string>()).length, 0);
});

test('returns an array containing each member of the input set', t => {
  t.deepEqual(unwrap<string[]>(set).sort(), values);
});

test('the returned array includes recursively-unwrapped child collections', t => {
  t.deepEqual(unwrap(set1), [unwrap(map1), unwrap(map2)]);
});
