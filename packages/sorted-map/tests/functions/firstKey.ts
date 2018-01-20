import test from 'ava';
import { numericCompare } from '@collectable/core';
import { empty, firstKey } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let map: SortedMap, values: number[];
test.before(() => {
  values = [13, 21, 34, 55, 1, 2, 3, 5, 8];
  map = fromNumericArray(values);
  values.sort(numericCompare);
});

test('returns the first key in the sorted index', t => {
  t.deepEqual(firstKey(map), values[0]);
});

test('returns undefined if the collection is empty', t => {
  t.is(firstKey(empty()), void 0);
});
