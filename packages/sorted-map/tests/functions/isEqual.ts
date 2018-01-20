import test from 'ava';
import { isEqual } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

const values0 = ['A', 'B', 'C', 'D', 'E'];
const values2 = ['A', 'B', 'C', 'D'];
const values3 = ['x', 'A', 'B', 'C', 'D', 'E'];
let map0: SortedMap,
    map1: SortedMap,
    map2: SortedMap,
    map3: SortedMap;
test.before(() => {
  map0 = fromStringArray(values0);
  map1 = fromStringArray(values0.slice()); // ensure the implementation doesn't retain the same array internally
  map2 = fromStringArray(values2);
  map3 = fromStringArray(values3);
});

test('returns true if both inputs contain equivalent maps of items', t => {
  t.true(isEqual(map0, map1));
});

test('returns false if either input contains items that cannot be found in the other', t => {
  t.false(isEqual(map0, map2));
  t.false(isEqual(map1, map2));
  t.false(isEqual(map0, map3));
  t.false(isEqual(map1, map3));
  t.false(isEqual(map2, map3));
});
