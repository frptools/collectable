import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure as SortedSet, size, union } from '../../src';
import { fromStringArray } from '../test-utils';

const mainValues = ['A', 'C', 'B', 'D', 'E'];
const otherValues = ['F', 'D', 'E', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
let main: SortedSet<string>, result: SortedSet<string>;
let other: Iterable<string>;

test.beforeEach(() => {
  other = new Set(otherValues).values();
  main = modify(fromStringArray(mainValues));
  result = union(other, main);
});

test('the input set is returned', t => {
  t.is(result, main);
});

test('the input set is still mutable', t => {
  t.true(isMutable(result));
});

test('the main set includes all items from both inputs', t => {
  t.deepEqual(Array.from(result), expectedValues);
  t.is(size(result), expectedValues.length);
});
