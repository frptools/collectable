import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { updateMap } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

let map: SortedMap;

test.beforeEach(() => {
  map = fromStringArray(['A', 'B', 'C']);
});

test('a mutable clone of the input map is passed to the predicate', t => {
  let called = false;
  updateMap(s => {
    called = true;
    t.not(s, map);
    t.deepEqual(Array.from(s), Array.from(map));
  }, map);
  t.true(called);
});

test('the mutable map argument is made immutable and returned, if the predicate returns nothing', t => {
  var inner: SortedMap = <any>void 0;
  const result = updateMap(s => {
    t.true(isMutable(s));
    inner = s;
  }, map);
  t.is(result, inner);
  t.true(isImmutable(result));
});

test('if the predicate returns a map instance other than the original argument, an immutable clone of it is returned', t => {
  const result = updateMap(s => {
    return modify(fromStringArray(['X', 'Y']));
  }, map);
  t.true(isImmutable(result));
  t.deepEqual<any>(Array.from(result), [['X', 'X'.charCodeAt(0)], ['Y', 'Y'.charCodeAt(0)]]);
});
