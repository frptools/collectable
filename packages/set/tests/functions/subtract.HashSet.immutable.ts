import test from 'ava';
import { isImmutable } from '@collectable/core';
import { HashSetStructure, fromArray, has, size, subtract } from '../../src';
import { snapshot } from '../test-utils';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C'];

let main: HashSetStructure<string>, mainSnapshot: object, result: HashSetStructure<string>;
let other: HashSetStructure<string>, otherSnapshot: object;

test.before(() => {
  other = fromArray(otherValues);
  otherSnapshot = snapshot(other);
  main = fromArray(mainValues);
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
