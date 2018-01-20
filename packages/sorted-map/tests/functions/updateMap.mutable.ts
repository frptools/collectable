import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { clone, updateMap } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

let map: SortedMap;
test.beforeEach(() => {
  map = modify(fromStringArray(['A', 'B', 'C']));
});

test('the input map is passed to the predicate', t => {
  let called = false;
  updateMap(s => {
    called = true;
    t.is(s, map);
  }, map);
  t.true(called);
});

test('returns the input map if nothing is returned from the predicate', t => {
  const result = updateMap(s => {}, map);
  t.is(result, map);
});

test('returns the return value of the predicate, if defined', t => {
  const result = updateMap(s => clone(s), map);
  t.not(result, map);
});

test('if the input map is returned, it is still mutable', t => {
  const result = updateMap(s => s, map);
  t.true(isMutable(result));
});
