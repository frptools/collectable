import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure, filter, has, size } from '../../src';
import { fromNumericArray } from '../test-utils';

let values0: number[],
    values1: number[],
    values2: number[];
const predicate1 = (n: number) => ((n >>> 1) << 1) !== n;
let set0: SortedSetStructure<number>, set1: SortedSetStructure<number>;

test.before(() => {
  values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  values1 = [1, 3, 5, 13, 21, 55];
  values2 = [2, 8, 34];
  set0 = modify(fromNumericArray(values0));
  set1 = filter(predicate1, set0);
});

test('the input set is returned', t => {
  t.is(set0, set1);
});

test('the input set is still mutable', t => {
  t.true(isMutable(set0));
});

test('the set size is decreased by the number of items excluded by the filter', t => {
  t.is(size(set0), values1.length);
});

test('the excluded items can no longer be retrieved from the set', t => {
  for(let k of values2) {
    t.false(has(k, set0));
  }
});

test('items not excluded by the filter can still be retrieved from the set', t => {
  for(let k of values1) {
    t.true(has(k, set0));
  }
});
