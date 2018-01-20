import test from 'ava';
import { isImmutable } from '@collectable/core';
import { HashSetStructure, add, fromArray, has, size } from '../../src';

let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
test.before(() => {
  set0 = fromArray(['A', 'B', 'C']);
  set1 = add('D', set0);
});

test('when the item does not exist in the set and the input set is immutable, the input set is not modified', t => {
  t.deepEqual(Array.from(set0).sort(), ['A', 'B', 'C']);
  t.is(size(set0), 3);
  t.true(isImmutable(set0));
});

test('when the item does not exist in the set and the input set is immutable, a new immutable set is returned', t => {
  t.true(isImmutable(set1));
});

test('when the item does not exist in the set and the input set is immutable, the size of the new set is one greater than that of the input set', t => {
  t.is(size(set1), 4);
});

test('when the item does not exist in the set and the input set is immutable, the new set has all of the items in the input set', t => {
  for(let c of Array.from(set0)) {
    t.true(has(c, set1));
  }
});

test('when the item does not exist in the set and the input set is immutable, the added item can be retrieved from the new set', t => {
  t.true(has('D', set1));
});

test('when the item does not exist in the set and the input set is immutable, all expected members exist in the new set in the correct order', t => {
  t.deepEqual(Array.from(set1).sort(), ['A', 'B', 'C', 'D']);
});