import test from 'ava';
import { has } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let map: SortedMap;
test.before(() => {
  map = fromStringArray(values);
});

test('returns true if the map contains the input item', t => {
  values.forEach(c => t.true(has(c, map)));
});

test('returns false if the map does not contain the input item', t => {
  t.false(has('a', map));
});
