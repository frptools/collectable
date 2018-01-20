import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure as SortedSet, size, union } from '../../src';
import { fromStringArray, snapshot } from '../test-utils';

const mainValues = ['A', 'C', 'B', 'D', 'E'];
const otherValues = ['F', 'D', 'E', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;
let other: SortedSet<string>, otherSnapshot: object;

test.beforeEach(() => {
  other = fromStringArray(otherValues);
  otherSnapshot = snapshot(other);
  main = fromStringArray(mainValues);
  mainSnapshot = snapshot(main);
  result = union(other, main);
});

test('a new immutable set is returned', t => {
  t.not(result, main);
  t.true(isImmutable(result));
});

test('the main set is not modified', t => {
  t.deepEqual(snapshot(main), mainSnapshot);
});

test('the other input set is not modified', t => {
  t.deepEqual(snapshot(other), otherSnapshot);
});

test('the main set includes all items from both inputs', t => {
  t.deepEqual(Array.from(result), expectedValues);
  t.is(size(result), expectedValues.length);
});
