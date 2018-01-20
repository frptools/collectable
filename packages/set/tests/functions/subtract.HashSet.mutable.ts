import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { HashSetStructure, fromArray, has, size, subtract } from '../../src';
import { snapshot } from '../test-utils';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C'];

let main: HashSetStructure<string>, result: HashSetStructure<string>;
let other: HashSetStructure<string>, otherSnapshot: object;

test.before(() => {
  other = fromArray(otherValues);
  otherSnapshot = snapshot(other);
  main = modify(fromArray(mainValues));
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
