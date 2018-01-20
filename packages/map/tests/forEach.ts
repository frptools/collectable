import test from 'ava';
import { HashMapStructure, forEach, fromArray } from '../src';

type Pair = [number, string];
let map: HashMapStructure<number, string>, values: Pair[];
test.beforeEach(() => {
  values = [1, 2, 3, 5, 8, 13, 21, 34, 55].map(n => <Pair>[n, `#${n}`]);
  map = fromArray(values);
});

test('the predicate is called for each item in the map', t => {
  const array: Pair[] = [];
  forEach((v, k) => array.push([k, v]), map);
  array.sort((a, b) => a[0] - b[0]);
  t.deepEqual(array, values);
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
  const set1 = forEach(n => {}, map);
  t.is(map, set1);
});
