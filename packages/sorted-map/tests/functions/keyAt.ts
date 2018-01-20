import test from 'ava';
import { numericCompare } from '@collectable/core';
import { keyAt } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let map: SortedMap, values: number[];
test.before(() => {
  values = [13, 21, 34, 55, 1, 2, 3, 5, 8];
  map = fromNumericArray(values);
  values.sort(numericCompare);
});

test('returns the key at the specified index', t => {
  for (let i = 0; i < values.length; i++) {
    t.deepEqual(keyAt(i, map), values[i]);
  }
});

test('returns undefined if the specified index is out of range', t => {
  t.is(keyAt(values.length, map), void 0);
});
