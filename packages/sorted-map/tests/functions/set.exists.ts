import test from 'ava';
import { has, set, size } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

let map0: SortedMap, map1: SortedMap;
test.beforeEach(() => {
  map0 = fromStringArray(['D', 'A', 'B']);
  map1 = set('B', 'B'.charCodeAt(0), map0);
});

test('the map size does not change', t => {
  t.is(size(map0), 3);
  t.is(size(map1), 3);
});

test('the input map is returned', t => {
  t.is(map0, map1);
});

test('the specified item can still be retrieved from the map', t => {
  t.true(has('B', map1));
});
