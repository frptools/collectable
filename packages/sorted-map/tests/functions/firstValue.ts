import test from 'ava';
import { numericCompare } from '@collectable/core';
import { empty, firstValue } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let map: SortedMap, values: number[];
test.before(() => {
  values = [13, 21, 34, 55, 1, 2, 3, 5, 8];
  map = fromNumericArray(values);
  values.sort(numericCompare);
});

test('returns the first value in the sorted index', t => {
  t.deepEqual(firstValue(map), `#${values[0]}`);
});

test('returns undefined if the collection is empty', t => {
  t.is(firstValue(empty()), void 0);
});
