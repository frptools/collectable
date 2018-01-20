import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { HashSetStructure, fromArray, size, union } from '../../src';
import { snapshot } from '../test-utils';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

let main: HashSetStructure<string>, result: HashSetStructure<string>;
let other: HashSetStructure<string>, otherSnapshot: object;

test.before(() => {
  other = fromArray(otherValues);
  otherSnapshot = snapshot(other);
  main = modify(fromArray(mainValues));
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
  t.deepEqual(Array.from(result).sort(), expectedValues);
  t.is(size(result), expectedValues.length);
});
