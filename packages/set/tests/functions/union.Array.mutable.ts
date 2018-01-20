import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { HashSetStructure, fromArray, size, union } from '../../src';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

let main: HashSetStructure<string>, result: HashSetStructure<string>;
const other = otherValues.slice();

test.before(() => {
  main = modify(fromArray(mainValues));
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
  t.deepEqual(Array.from(result).sort(), expectedValues);
  t.is(size(result), expectedValues.length);
});
