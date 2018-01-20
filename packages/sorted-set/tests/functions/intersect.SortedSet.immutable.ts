import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure as SortedSet, has, intersect, size } from '../../src';
import { fromStringArray, snapshot } from '../test-utils';

const mainValues = ['B', 'C', 'A', 'D', 'E'];
const otherValues = ['F', 'E', 'D', 'G'];
const expectedValues = ['D', 'E'];
let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;
let other: SortedSet<string>, otherSnapshot: object;

test.beforeEach(() => {
  other = fromStringArray(otherValues);
  otherSnapshot = snapshot(other);
  main = fromStringArray(mainValues);
  mainSnapshot = snapshot(main);
  result = intersect(other, main);
});

test('a new immutable set is returned', t => {
  t.not(result, main);
  t.true(isImmutable(result));
});

test('the main input set is not modified', t => {
  t.deepEqual(snapshot(main), mainSnapshot);
});

test('the other input set is not modified', t => {
  t.deepEqual(snapshot(other), otherSnapshot);
});

test('the new set excludes items that are unique to the other input', t => {
  t.false(has('A', result));
  t.false(has('B', result));
  t.false(has('C', result));
});

test('the new set excludes items that are unique to the main input', t => {
  t.true(has('D', result));
  t.true(has('E', result));
});

test('the new set includes items that are common to both inputs', t => {
  t.deepEqual(Array.from(result), expectedValues);
});

test('the size of the new set is equal to the total number of items that are common to both inputs', t => {
  t.is(size(result), expectedValues.length);
});
