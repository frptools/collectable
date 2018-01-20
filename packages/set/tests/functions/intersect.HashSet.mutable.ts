import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { HashSetStructure, fromArray, has, intersect, size } from '../../src';
import { snapshot } from '../test-utils';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['D', 'E'];

let main: HashSetStructure<string>, result: HashSetStructure<string>;
let other: HashSetStructure<string>, otherSnapshot: object;

test.before(() => {
  other = fromArray(otherValues);
  otherSnapshot = snapshot(other);
});

test.before(() => {
  main = modify(fromArray(mainValues));
  result = intersect(other, main);
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

test('the main set excludes items that are not also members of the other input', t => {
  t.false(has('A', result));
  t.false(has('B', result));
  t.false(has('C', result));
});

test('the main set retains items that are also members of the other input', t => {
  t.true(has('D', result));
  t.true(has('E', result));
});

test('the size of the main set is decreased by the number of items that were unique to it', t => {
  t.is(size(result), expectedValues.length);
});
