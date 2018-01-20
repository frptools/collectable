import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { SortedSetStructure, clone, update } from '../../src';
import { fromStringArray } from '../test-utils';

let set: SortedSetStructure<string>;
test.beforeEach(() => {
  set = modify(fromStringArray(['A', 'B', 'C']));
});

test('the input set is passed to the predicate', t => {
  let called = false;
  update(s => {
    called = true;
    t.is(s, set);
  }, set);
  t.true(called);
});

test('returns the input set if nothing is returned from the predicate', t => {
  const result = update(s => {}, set);
  t.is(result, set);
});

test('returns the return value of the predicate, if defined', t => {
  const result = update(s => clone(s), set);
  t.not(result, set);
});

test('if the input set is returned, it is still mutable', t => {
  const result = update(s => s, set);
  t.true(isMutable(result));
});
