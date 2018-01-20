import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure as SortedSet, has, size, subtract } from '../../src';
import { fromStringArray, snapshot } from '../test-utils';

const mainValues = ['D', 'E', 'C', 'A', 'B'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C'];
let main: SortedSet<string>, result: SortedSet<string>;
let other: SortedSet<string>, otherSnapshot: object;

test.beforeEach(() => {
  other = fromStringArray(otherValues);
  otherSnapshot = snapshot(other);
  main = modify(fromStringArray(mainValues));
  result = subtract(other, main);
});

test('the main input set is returned', t => {
  t.is(result, main);
});

test('the main set is still mutable', t => {
  t.true(isMutable(result));
});

test('the other input set is not modified', t => {
  t.deepEqual(snapshot(other), otherSnapshot);
});

test('the main set no longer includes any items that are members of the other set', t => {
  t.true(has('A', result));
  t.true(has('B', result));
  t.true(has('C', result));
});

test('the main set retains items that are not members of the other set', t => {
  t.false(has('D', result));
  t.false(has('E', result));
});

test('the size of the main set is decreased by the number of items that were common to both inputs', t => {
  t.is(size(result), expectedValues.length);
});
