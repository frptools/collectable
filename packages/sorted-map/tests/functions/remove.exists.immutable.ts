import test from 'ava';
import { isImmutable } from '@collectable/core';
import { has, remove, size } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

let map0: SortedMap, map1: SortedMap;
const values0 = ['A', 'B', 'C', 'D', 'E'];
const values1 = ['A', 'B', 'D', 'E'];

test.before(() => {
  map0 = fromStringArray(values0);
  map1 = remove('C', map0);
});

test('the input map is not modified', t => {
  t.is(size(map0), values0.length);
  t.deepEqual(Array.from(map0), pairsFrom(values0));
  t.true(isImmutable(map0));
});

test('a new immutable map is returned', t => {
  t.not(map0, map1);
  t.true(isImmutable(map1));
});

test('the size of the new map is one less than that of the input map', t => {
  t.is(size(map1), values1.length);
});

test('the removed item can no longer be retrieved from the new map', t => {
  t.false(has('C', map1));
});

test('the new map contains all items from the input map other than the removed item', t => {
  t.deepEqual(Array.from(map1), pairsFrom(values1));
});
