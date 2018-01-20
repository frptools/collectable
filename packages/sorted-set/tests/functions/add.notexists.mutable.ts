import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure, add, has, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.before(() => {
  set0 = modify(fromStringArray(['A', 'B', 'D']));
  set1 = add('C', set0);
});

test('the input set is returned', t => {
  t.is(set0, set1);
});

test('the input set is still mutable', t => {
  t.true(isMutable(set1));
});

test('the set size is incremented', t => {
  t.is(size(set1), 4);
});

test('the added item can be retrieved from the set', t => {
  t.true(has('C', set1));
});

test('all expected members exist in the set in the correct order', t => {
  t.deepEqual(Array.from(set1), ['A', 'B', 'C', 'D']);
});
