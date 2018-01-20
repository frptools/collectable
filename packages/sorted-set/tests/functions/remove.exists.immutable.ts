import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure, has, remove, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
const values0 = ['A', 'B', 'C', 'D', 'E'];
const values1 = ['A', 'B', 'D', 'E'];
test.before(() => {
  set0 = fromStringArray(values0);
  set1 = remove('C', set0);
});

test('the input set is not modified', t => {
  t.is(size(set0), values0.length);
  t.deepEqual(Array.from(set0), values0);
  t.true(isImmutable(set0));
});

test('a new immutable set is returned', t => {
  t.not(set0, set1);
  t.true(isImmutable(set1));
});

test('the size of the new set is one less than that of the input set', t => {
  t.is(size(set1), values1.length);
});

test('the removed item can no longer be retrieved from the new set', t => {
  t.false(has('C', set1));
});

test('the new set contains all items from the input set other than the removed item', t => {
  t.deepEqual(Array.from(set1), values1);
});
