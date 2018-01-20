import test from 'ava';
import { numericCompare } from '@collectable/core';
import { at } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let map: SortedMap, values: number[];
test.before(() => {
  values = [13, 21, 34, 55, 1, 2, 3, 5, 8];
  map = fromNumericArray(values);
  values.sort(numericCompare);
});

test('returns the entry at the specified index', t => {
  for (let i = 0; i < values.length; i++) {
    t.deepEqual(at(i, map), [values[i], `#${values[i]}`]);
  }
});

test('returns undefined if the specified index is out of range', t => {
  t.is(at(values.length, map), void 0);
});
