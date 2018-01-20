import test from 'ava';
import { commit, isImmutable, isMutable, modify } from '@collectable/core';
import { empty } from '../../src';

test('when committing, if the input set is already immutable, it is returned unmodified', t => {
  const set = empty();
  t.is(commit(set), set);
});

test('when committing, if the input set is mutable, it is frozen and returned', t => {
  const set = modify(empty());
  t.is(commit(set), set);
  t.true(isImmutable(set));
});

test('modifying returns true if the input set is immutable', t => {
  const set = empty();
  t.true(isImmutable(set));
});

test('modifying returns false if the input set is mutable', t => {
  const set = modify(empty());
  t.false(isImmutable(set));
});

test('when modifying a set, if it is already mutable, it is returned unmodified', t => {
  const set = modify(empty());
  t.is(modify(set), set);
});

test('when modifying a set, if it is immutable, a mutable clone is returned', t => {
  const set = empty();
  t.not(modify(set), set);
});

test('a mutable set is reported as being mutable', t => {
  const set = modify(empty());
  t.true(isMutable(set));
});

test('an immutable set is reported as being immutable', t => {
  const set = empty();
  t.false(isMutable(set));
});
