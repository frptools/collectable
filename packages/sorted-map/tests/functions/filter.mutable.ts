import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { filter, has, size } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let values0: number[],
    values1: number[],
    values2: number[];
const predicate1 = (_: any, n: number) => ((n >>> 1) << 1) !== n;
test.before(() => {
  values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  values1 = [1, 3, 5, 13, 21, 55];
  values2 = [2, 8, 34];
});

let map0: SortedMap, map1: SortedMap;

test.before(() => {
  map0 = modify(fromNumericArray(values0));
  map1 = filter(predicate1, map0);
});

test('the input map is returned', t => {
  t.is(map0, map1);
});

test('the input map is still mutable', t => {
  t.true(isMutable(map0));
});

test('the map size is decreased by the number of items excluded by the filter', t => {
  t.is(size(map0), values1.length);
});

test('the excluded items can no longer be retrieved from the map', t => {
  for(let k of values2) {
    t.false(has(k, map0));
  }
});

test('items not excluded by the filter can still be retrieved from the map', t => {
  for(let k of values1) {
    t.true(has(k, map0));
  }
});
