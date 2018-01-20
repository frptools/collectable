import test from 'ava';
import { HashSetStructure, forEach, fromArray } from '../../src';

let set: HashSetStructure<number>, values: number[];
test.before(() => {
  values = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  set = fromArray(values);
});

test('the predicate is called for each item in the set', t => {
  const array: number[] = [];
  forEach(n => array.push(n), set);
  t.deepEqual(array.sort((a, b) => a - b), values);
});

test('iteration is terminated if `false` is explicitly returned from the predicate', t => {
  let count = 0;
  forEach((n, i) => {
    count++;
    if(i === 3) return false;
  }, set);
  t.is(count, 4);
});

test('the input set is returned after iteration is complete', t => {
  const set1 = forEach(n => {}, set);
  t.is(set, set1);
});
