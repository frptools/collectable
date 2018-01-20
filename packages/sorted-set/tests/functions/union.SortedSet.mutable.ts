import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure as SortedSet, size, union } from '../../src';
import { fromStringArray, snapshot } from '../test-utils';

const mainValues = ['A', 'C', 'B', 'D', 'E'];
const otherValues = ['F', 'D', 'E', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
let main: SortedSet<string>, result: SortedSet<string>;
let other: SortedSet<string>, otherSnapshot: object;

test.beforeEach(() => {
  other = fromStringArray(otherValues);
  otherSnapshot = snapshot(other);
  main = modify(fromStringArray(mainValues));
  result = union(other, main);
});

test('the main set is returned', t => {
  t.is(result, main);
});

test('the main set is still mutable', t => {
  t.true(isMutable(result));
});

test('the other input set is not modified', t => {
  t.deepEqual(snapshot(other), otherSnapshot);
});

test('the main set includes all items from both inputs', t => {
  t.deepEqual(Array.from(result), expectedValues);
  t.is(size(result), expectedValues.length);
});
