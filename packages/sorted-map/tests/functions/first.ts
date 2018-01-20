import test from 'ava';
import { numericCompare } from '@collectable/core';
import { empty, first } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let map: SortedMap, values: number[];
test.before(() => {
  values = [13, 21, 34, 55, 1, 2, 3, 5, 8];
  map = fromNumericArray(values);
  values.sort(numericCompare);
});

test('returns the first entry in the sorted index', t => {
  t.deepEqual(first(map), [values[0], `#${values[0]}`]);
});

test('returns undefined if the collection is empty', t => {
  t.is(first(empty()), void 0);
});
