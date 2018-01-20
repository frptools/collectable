import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure as SortedSet, size, union } from '../../src';
import { fromStringArray, snapshot } from '../test-utils';

const mainValues = ['A', 'C', 'B', 'D', 'E'];
const otherValues = ['F', 'D', 'E', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const other = otherValues.slice();
let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;

test.beforeEach(() => {
  main = fromStringArray(mainValues);
  mainSnapshot = snapshot(main);
  result = union(other, main);
});

test('a new immutable set is returned', t => {
  t.not(result, main);
  t.true(isImmutable(result));
});

test('the input set is not modified', t => {
  t.deepEqual(snapshot(main), mainSnapshot);
});

test('the input array is not modified', t => {
  t.deepEqual(other, otherValues);
});

test('the main set includes all items from both inputs', t => {
  t.deepEqual(Array.from(result), expectedValues);
  t.is(size(result), expectedValues.length);
});
