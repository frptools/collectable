import test from 'ava';
import { has, remove, size } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

let map0: SortedMap, map1: SortedMap;
test.beforeEach(() => {
  map0 = fromStringArray(['A', 'B', 'C']);
  map1 = remove('D', map0);
});

test('the map size does not change', t => {
  t.is(size(map1), 3);
});

test('the input map is returned unmodified', t => {
  t.is(map0, map1);
});

test('the item is still unretrievable from the map', t => {
  t.false(has('D', map1));
});
