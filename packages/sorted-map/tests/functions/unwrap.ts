import test from 'ava';
import { RedBlackTreeStructure, fromObject } from '@collectable/red-black-tree';
import { unwrap } from '@collectable/core';
import { empty, fromArray } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let map: SortedMap, map1: SortedMap;
let tree1: RedBlackTreeStructure<any, any>, tree2: RedBlackTreeStructure<any, any>;
test.beforeEach(() => {
  map = fromStringArray(values);
  tree1 = fromObject<string>(values);
  tree2 = fromObject<string>(values);
  map1 = fromArray<string, RedBlackTreeStructure<any, any>>([['A', tree1], ['B', tree2]]);
});

test('returns an empty object if the map is empty', t => {
  t.deepEqual(unwrap(empty<string, number>()), {});
});

test('returns an array containing each member of the input map', t => {
  t.deepEqual(unwrap(map), values.reduce((o, v) => (o[v] = v.charCodeAt(0), o), <any>{}));
});

test('the returned array includes recursively-unwrapped child collections', t => {
  t.deepEqual(unwrap(map1), { A: unwrap(tree1), B: unwrap(tree2) });
});
