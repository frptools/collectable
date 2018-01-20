import test from 'ava';
import { empty, toNativeMap } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let map: SortedMap;
test.beforeEach(() => {
  map = fromStringArray(values);
});

test('returns an empty map if the input map is empty', t => {
  t.is(toNativeMap(empty()).size, 0);
});

test('returns a native map containing each member of the input map', t => {
  t.deepEqual(Array.from(toNativeMap(map)), pairsFrom(values));
});
