import test from 'ava';
import { commit, isImmutable, isMutable, modify } from '@collectable/core';
import { empty } from '../../src';

test('when committing an immutable input set, it is returned unmodified', t => {
  const set = empty();
  t.is(commit(set), set);
});

test('when committing a mutable input set, it is frozen and then returned', t => {
  const set = modify(empty());
  t.is(commit(set), set);
  t.true(isImmutable(set));
});

test('isImmutable() returns true if the input set is immutable', t => {
  const set = empty();
  t.true(isImmutable(set));
});

test('isImmutable() returns false if the input set is mutable', t => {
  const set = modify(empty());
  t.false(isImmutable(set));
});

test('modify() returns a mutable input set unmodified', t => {
  const set = modify(empty());
  t.is(modify(set), set);
});

test('modify() returns a mutable clone of an immutable input set', t => {
  const set = empty();
  t.not(modify(set), set);
});

test('isMutable() returns true if the input set is mutable', t => {
  const set = modify(empty());
  t.true(isMutable(set));
});

test('isMutable() returns false if the input set is immutable', t => {
  const set = empty();
  t.false(isMutable(set));
});
