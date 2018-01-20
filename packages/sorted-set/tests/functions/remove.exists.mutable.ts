import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure, has, remove, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
const values0 = ['A', 'B', 'C', 'D', 'E'];
const values1 = ['A', 'B', 'D', 'E'];
test.before(() => {
  set0 = modify(fromStringArray(values0));
  set1 = remove('C', set0);
});

test('the input set is returned', t => {
  t.is(set0, set1);
});

test('the input set is still mutable', t => {
  t.true(isMutable(set0));
});

test('the input set size is decremented', t => {
  t.is(size(set0), values1.length);
});

test('the removed item can no longer be retrieved from the input set', t => {
  t.false(has('C', set0));
});

test('the input set still contains all items other than the removed item', t => {
  t.deepEqual(Array.from(set0), values1);
});
