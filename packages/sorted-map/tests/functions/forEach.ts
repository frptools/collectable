import test from 'ava';
import { forEach } from '../../src';
import { SortedMap, fromNumericArray, pairsFrom } from '../test-utils';

let map: SortedMap, values: number[];
test.before(() => {
  values = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  map = fromNumericArray(values);
});

test('the predicate is called for each item in the map', t => {
  const array: [number, string][] = [];
  forEach((v, k) => array.push([k, v]), map);
  t.deepEqual(array, pairsFrom(values));
});

test('iteration is terminated if `false` is explicitly returned from the predicate', t => {
  let count = 0;
  forEach((v, k, i) => {
    count++;
    if(i === 3) return false;
  }, map);
  t.is(count, 4);
});

test('the input map is returned after iteration is complete', t => {
  const map1 = forEach(n => {}, map);
  t.is(map, map1);
});
