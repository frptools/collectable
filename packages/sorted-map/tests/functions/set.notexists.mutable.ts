import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { has, set, size } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

let map0: SortedMap, map1: SortedMap;

test.before(() => {
  map0 = modify(fromStringArray(['A', 'B', 'D']));
  map1 = set('C', 'C'.charCodeAt(0), map0);
});

test('the input map is returned', t => {
  t.is(map0, map1);
});

test('the input map is still mutable', t => {
  t.true(isMutable(map1));
});

test('the map size is incremented', t => {
  t.is(size(map1), 4);
});

test('the seted item can be retrieved from the map', t => {
  t.true(has('C', map1));
});

test('all expected members exist in the map in the correct order', t => {
  t.deepEqual(Array.from(map1), pairsFrom(['A', 'B', 'C', 'D']));
});
