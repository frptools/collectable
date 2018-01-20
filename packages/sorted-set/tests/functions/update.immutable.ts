import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { SortedSetStructure, update } from '../../src';
import { fromStringArray } from '../test-utils';

let set: SortedSetStructure<string>;
test.beforeEach(() => {
  set = fromStringArray(['A', 'B', 'C']);
});

test('a mutable clone of the input set is passed to the predicate', t => {
  let called = false;
  update(s => {
    called = true;
    t.not(s, set);
    t.deepEqual(Array.from(s), Array.from(set));
  }, set);
  t.true(called);
});

test('the mutable set argument is made immutable and returned, if the predicate returns nothing', t => {
  var inner: SortedSetStructure<string> = <any>void 0;
  const result = update(s => {
    t.true(isMutable(s));
    inner = s;
  }, set);
  t.is(result, inner);
  t.true(isImmutable(result));
});

test('if the predicate returns a set instance other than the original argument, an immutable clone of it is returned', t => {
  const result = update(s => {
    return modify(fromStringArray(['X', 'Y']));
  }, set);
  t.true(isImmutable(result));
  t.deepEqual(Array.from(result), ['X', 'Y']);
});
