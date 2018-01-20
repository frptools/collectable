import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure as SortedSet, has, size, subtract } from '../../src';
import { fromStringArray, snapshot } from '../test-utils';

const mainValues = ['D', 'E', 'C', 'A', 'B'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C'];

let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;
let other: SortedSet<string>, otherSnapshot: object;

test.beforeEach(() => {
  other = fromStringArray(otherValues);
  otherSnapshot = snapshot(other);
  main = fromStringArray(mainValues);
  mainSnapshot = snapshot(main);
  result = subtract(other, main);
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

test('the new set does not include any items that are members of the other set', t => {
  t.true(has('A', result));
  t.true(has('B', result));
  t.true(has('C', result));
});

test('the new set includes all items from the main input set that are not members of the other set', t => {
  t.false(has('D', result));
  t.false(has('E', result));
});

test('the size of the new set is that of the input set, minus the number of items that were common to both inputs', t => {
  t.is(size(result), expectedValues.length);
});
