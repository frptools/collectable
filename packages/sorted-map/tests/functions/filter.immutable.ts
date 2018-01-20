import test from 'ava';
import { isImmutable } from '@collectable/core';
import { filter, size } from '../../src';
import { SortedMap, fromNumericArray, pairsFrom } from '../test-utils';

let values0: number[],
    values1: number[];
const predicate1 = (_: any, n: number) => ((n >>> 1) << 1) !== n;
test.before(() => {
  values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  values1 = [1, 3, 5, 13, 21, 55];
});

let map0: SortedMap, map1: SortedMap;
test.before(() => {
  map0 = fromNumericArray(values0);
  map1 = filter(predicate1, map0);
});

test('the input map is not modified', t => {
  t.not(map0, map1);
  t.is(size(map0), values0.length);
  t.deepEqual(Array.from(map0), pairsFrom(values0));
  t.true(isImmutable(map0));
});

test('a new immutable map is returned', t => {
  t.true(isImmutable(map1));
});

test('the size of the new map equals that of the input map, minus the number of items excluded by the filter', t => {
  t.is(size(map1), values1.length);
});

test('the new map contains only the items from the input map that were not excluded by the filter', t => {
  t.deepEqual(Array.from(map1), pairsFrom(values1));
});
