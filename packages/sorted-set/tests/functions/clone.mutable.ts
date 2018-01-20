import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure, add, clone, remove, size } from '../../src';
import { extractMap } from '../../src/internals';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.beforeEach(() => {
  set0 = modify(fromStringArray(['A', 'B', 'C']));
  set1 = clone(set0);
});

test('a new mutable set is returned', t => {
  t.true(isMutable(set0));
  t.true(isMutable(set1));
  t.not(set0, set1);
  t.not(extractMap(set0), extractMap(set1));
});

test('the new set has the same size as the input set', t => {
  t.is(size(set1), size(set0));
});

test('the new set has all of the items in the input set', t => {
  t.deepEqual(Array.from(set0), Array.from(set1));
});

test('changes made to the new set do not affect the input set', t => {
  remove('A', set1);
  add('E', set1);
  t.deepEqual(Array.from(set0), ['A', 'B', 'C']);
  t.deepEqual(Array.from(set1), ['B', 'C', 'E']);
});
