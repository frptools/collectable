import test from 'ava';
import { isImmutable } from '@collectable/core';
import { HashSetStructure, fromArray, size, union } from '../../src';
import { snapshot } from '../test-utils';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

let main: HashSetStructure<string>, mainSnapshot: object, result: HashSetStructure<string>;
let other: HashSetStructure<string>, otherSnapshot: object;

test.before(() => {
  other = fromArray(otherValues);
  otherSnapshot = snapshot(other);
});

test.before(() => {
  main = fromArray(mainValues);
  mainSnapshot = snapshot(main);
  result = union(other, main);
});

test('a new immutable set is returned', t => {
  t.not(result, main);
  t.true(isImmutable(result));
});

test('the main set is not modified', t => {
  t.deepEqual(snapshot(main), mainSnapshot);
});

test('the other input set is not modified', t => {
  t.deepEqual(snapshot(other), otherSnapshot);
});

test('the main set includes all items from both inputs', t => {
  t.deepEqual(Array.from(result).sort(), expectedValues);
  t.is(size(result), expectedValues.length);
});
