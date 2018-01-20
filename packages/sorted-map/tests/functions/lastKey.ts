import test from 'ava';
import { numericCompare } from '@collectable/core';
import { empty, lastKey } from '../../src';
import { SortedMap, fromNumericArray } from '../test-utils';

let map: SortedMap, values: number[], lastIndex;
test.before(() => {
  values = [13, 21, 34, 55, 1, 2, 3, 5, 8];
  map = fromNumericArray(values);
  values.sort(numericCompare);
  lastIndex = values.length - 1;
});

test('returns the last key in the sorted index', t => {
  t.deepEqual(lastKey(map), values[lastIndex]);
});

test('returns undefined if the collection is empty', t => {
  t.is(lastKey(empty()), void 0);
});
