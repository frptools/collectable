import test from 'ava';
import { isImmutable } from '@collectable/core';
import { HashSetStructure, fromArray, has, intersect, size } from '../../src';
import { snapshot } from '../test-utils';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['D', 'E'];

let main: HashSetStructure<string>, mainSnapshot: object, result: HashSetStructure<string>;
let other: HashSetStructure<string>, otherSnapshot: object;

test.before(() => {
  other = fromArray(otherValues);
  otherSnapshot = snapshot(other);
  main = fromArray(mainValues);
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
  t.deepEqual(Array.from(result).sort(), expectedValues);
});

test('the size of the new set is equal to the total number of items that are common to both inputs', t => {
  t.is(size(result), expectedValues.length);
});
