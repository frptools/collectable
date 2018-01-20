import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure as SortedSet, size, union } from '../../src';
import { fromStringArray } from '../test-utils';

const mainValues = ['A', 'C', 'B', 'D', 'E'];
const otherValues = ['F', 'D', 'E', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const other = otherValues.slice();
let main: SortedSet<string>, result: SortedSet<string>;

test.beforeEach(() => {
  main = modify(fromStringArray(mainValues));
  result = union(other, main);
});

test('the input set is returned', t => {
  t.is(result, main);
});

test('the input set is still mutable', t => {
  t.true(isMutable(result));
});

test('the input array is not modified', t => {
  t.deepEqual(other, otherValues);
});

test('the main set includes all items from both inputs', t => {
  t.deepEqual(Array.from(result), expectedValues);
  t.is(size(result), expectedValues.length);
});
