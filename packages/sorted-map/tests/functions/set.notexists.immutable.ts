import test from 'ava';
import { isImmutable } from '@collectable/core';
import { has, set, size } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

let map0: SortedMap, map1: SortedMap;

test.before(() => {
  map0 = fromStringArray(['A', 'B', 'D']);
  map1 = set('C', 'C'.charCodeAt(0), map0);
});

test('the input map is not modified', t => {
  t.deepEqual(Array.from(map0), pairsFrom(['A', 'B', 'D']));
  t.is(size(map0), 3);
  t.true(isImmutable(map0));
});

test('a new immutable map is returned', t => {
  t.true(isImmutable(map1));
});

test('the size of the new map is one greater than that of the input map', t => {
  t.is(size(map1), 4);
});

test('the new map has all of the items in the input map', t => {
  for(let c of Array.from(map0)) {
    t.true(has(c[0], map1));
  }
});

test('the seted item can be retrieved from the new map', t => {
  t.true(has('C', map1));
});

test('all expected members exist in the new map in the correct order', t => {
  t.deepEqual(Array.from(map1), pairsFrom(['A', 'B', 'C', 'D']));
});
