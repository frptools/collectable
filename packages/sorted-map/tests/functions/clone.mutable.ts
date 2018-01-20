import test from 'ava';
import { clone, remove, set, size } from '../../src';
import { extractMap } from '../../src/internals';
import { isMutable, modify } from '@collectable/core';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

let map0: SortedMap, map1: SortedMap;
test.beforeEach(() => {
  map0 = modify(fromStringArray(['A', 'B', 'C']));
  map1 = clone(map0);
});

test('a new mutable set is returned', t => {
  t.true(isMutable(map0));
  t.true(isMutable(map1));
  t.not(map0, map1);
  t.not(extractMap(map0), extractMap(map1));
});

test('the new map has the same size as the input map', t => {
  t.is(size(map1), size(map0));
});

test('the new map has all of the items in the input map', t => {
  t.deepEqual(Array.from(map0), Array.from(map1));
});

test('changes made to the new map do not affect the input map', t => {
  remove('A', map1);
  set('E', 'E'.charCodeAt(0), map1);
  t.deepEqual(Array.from(map0), pairsFrom(['A', 'B', 'C']));
  t.deepEqual(Array.from(map1), pairsFrom(['B', 'C', 'E']));
});
