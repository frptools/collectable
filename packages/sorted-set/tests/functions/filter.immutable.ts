import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure, filter, size } from '../../src';
import { fromNumericArray } from '../test-utils';

let values0: number[],
    values1: number[];
    const predicate1 = (n: number) => ((n >>> 1) << 1) !== n;
let set0: SortedSetStructure<number>, set1: SortedSetStructure<number>;

test.before(() => {
  values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  values1 = [1, 3, 5, 13, 21, 55];
  set0 = fromNumericArray(values0);
  set1 = filter(predicate1, set0);
});

test('the input set is not modified', t => {
  t.not(set0, set1);
  t.is(size(set0), values0.length);
  t.deepEqual(Array.from(set0), values0);
  t.true(isImmutable(set0));
});

test('a new immutable set is returned', t => {
  t.true(isImmutable(set1));
});

test('the size of the new set equals that of the input set, minus the number of items excluded by the filter', t => {
  t.is(size(set1), values1.length);
});

test('the new set contains only the items from the input set that were not excluded by the filter', t => {
  t.deepEqual(Array.from(set1), values1);
});
