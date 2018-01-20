import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure as SortedSet, has, intersect, size } from '../../src';
import { fromStringArray } from '../test-utils';

const mainValues = ['B', 'C', 'A', 'D', 'E'];
const otherValues = ['F', 'E', 'D', 'G'];
const expectedValues = ['D', 'E'];
const other = otherValues.slice();

let main: SortedSet<string>, result: SortedSet<string>;
test.beforeEach(() => {
  main = modify(fromStringArray(mainValues));
  result = intersect(other, main);
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

test('the input set excludes items that are not also members of the other input', t => {
  t.false(has('A', result));
  t.false(has('B', result));
  t.false(has('C', result));
});

test('the input set retains items that are also members of the other input', t => {
  t.true(has('D', result));
  t.true(has('E', result));
});

test('the size of the input set is decreased by the number of items that were unique to it', t => {
  t.is(size(result), expectedValues.length);
});
