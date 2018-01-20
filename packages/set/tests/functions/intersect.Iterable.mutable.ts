import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { HashSetStructure, fromArray, has, intersect, size } from '../../src';

const mainValues = ['A', 'B', 'C', 'D', 'E'];
const otherValues = ['D', 'E', 'F', 'G'];
const expectedValues = ['D', 'E'];

let main: HashSetStructure<string>, result: HashSetStructure<string>;
let other: Iterable<string>;

test.before(() => {
  other = new Set(otherValues).values();
  main = modify(fromArray(mainValues));
  result = intersect(other, main);
});

test('the input set is returned', t => {
  t.is(result, main);
});

test('the input set is still mutable', t => {
  t.true(isMutable(result));
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
