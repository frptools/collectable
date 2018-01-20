import test from 'ava';
import { empty, toArray } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let map: SortedMap;
test.beforeEach(() => {
  map = fromStringArray(values);
});

test('returns an empty array if the map is empty', t => {
  t.is(toArray(empty()).length, 0);
});

test('returns an array containing each member of the input map', t => {
  t.deepEqual(toArray(map), pairsFrom(values));
});
