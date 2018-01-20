import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure, add, clone, remove, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.beforeEach(() => {
  set0 = fromStringArray(['A', 'B', 'C']);
  set1 = clone(set0);
});

test('a new immutable set is returned', t => {
  t.not(set0, set1);
  t.true(isImmutable(set1));
});

test('the new set has the same size as the input set', t => {
  t.is(size(set1), size(set0));
});

test('the new set has all of the items in the input set', t => {
  t.deepEqual(Array.from(set0), Array.from(set1));
});

test('changes made to the new set do not affect the input set', t => {
  const set2 = add('E', remove('A', set1));
  t.deepEqual(Array.from(set1), ['A', 'B', 'C']);
  t.deepEqual(Array.from(set2), ['B', 'C', 'E']);
});
