import test from 'ava';
import { isImmutable } from '@collectable/core';
import { SortedSetStructure, add, has, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.before(() => {
  set0 = fromStringArray(['A', 'B', 'D']);
  set1 = add('C', set0);
});

test('when the item does not exist in the set, the input set is not modified', t => {
  t.deepEqual(Array.from(set0), ['A', 'B', 'D']);
  t.is(size(set0), 3);
  t.true(isImmutable(set0));
});

test('when the item does not exist in the set, a new immutable set is returned', t => {
  t.true(isImmutable(set1));
});

test('when the item does not exist in the set, the size of the new set is one greater than that of the input set', t => {
  t.is(size(set1), 4);
});

test('when the item does not exist in the set, the new set has all of the items in the input set', t => {
  for(let c of Array.from(set0)) {
    t.true(has(c, set1));
  }
});

test('when the item does not exist in the set, the added item can be retrieved from the new set', t => {
  t.true(has('C', set1));
});

test('when the item does not exist in the set, all expected members exist in the new set in the correct order', t => {
  t.deepEqual(Array.from(set1), ['A', 'B', 'C', 'D']);
});
