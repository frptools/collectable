import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { has, remove, size } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

const values0 = ['A', 'B', 'C', 'D', 'E'];
const values1 = ['A', 'B', 'D', 'E'];
let map0: SortedMap, map1: SortedMap;

test.beforeEach(() => {
  map0 = modify(fromStringArray(values0));
  map1 = remove('C', map0);
});

test('the input map is returned', t => {
  t.is(map0, map1);
});

test('the input map is still mutable', t => {
  t.true(isMutable(map0));
});

test('the input map size is decremented', t => {
  t.is(size(map0), values1.length);
});

test('the removed item can no longer be retrieved from the input map', t => {
  t.false(has('C', map0));
});

test('the input map still contains all items other than the removed item', t => {
  t.deepEqual(Array.from(map0), pairsFrom(values1));
});
