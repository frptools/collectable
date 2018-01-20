import test from 'ava';
import { clone, remove, set, size } from '../../src';
import { isImmutable } from '@collectable/core';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

let map0: SortedMap, map1: SortedMap;
test.beforeEach(() => {
  map0 = fromStringArray(['A', 'B', 'C']);
  map1 = clone(map0);
});

test('a new immutable map is returned', t => {
  t.not(map0, map1);
  t.true(isImmutable(map1));
});

test('the new map has the same size as the input map', t => {
  t.is(size(map1), size(map0));
});

test('the new map has all of the items in the input map', t => {
  t.deepEqual(Array.from(map0), Array.from(map1));
});

test('changes made to the new map do not affect the input map', t => {
  const map2 = set('E', 'E'.charCodeAt(0), remove('A', map1));
  t.deepEqual(Array.from(map1), pairsFrom(['A', 'B', 'C']));
  t.deepEqual(Array.from(map2), pairsFrom(['B', 'C', 'E']));
});
