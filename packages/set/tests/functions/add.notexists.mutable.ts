import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { HashSetStructure, add, fromArray, has, size } from '../../src';

let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
test.before(() => {
  set0 = modify(fromArray(['A', 'B', 'C']));
  set1 = add('D', set0);
});

test('when the item does not exist in the set and the input set is mutable, the input set is returned', t => {
  t.is(set0, set1);
});

test('when the item does not exist in the set and the input set is mutable, the input set is still mutable', t => {
  t.true(isMutable(set1));
});

test('when the item does not exist in the set and the input set is mutable, the set size is incremented', t => {
  t.is(size(set1), 4);
});

test('when the item does not exist in the set and the input set is mutable, the added item can be retrieved from the set', t => {
  t.true(has('D', set1));
});

test('when the item does not exist in the set and the input set is mutable, the set has all of the items it had before the new item was added', t => {
  for(let c of Array.from(set0)) {
    t.true(has(c, set1));
  }
});
