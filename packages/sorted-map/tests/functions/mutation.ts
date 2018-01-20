import test from 'ava';
import { commit, isImmutable, isMutable, modify } from '@collectable/core';
import { empty } from '../../src';

test('when committing an immutable input map, it is returned unmodified', t => {
  const map = empty();
  t.is(commit(map), map);
});

test('when committing a mutable input map, it is frozen and then returned', t => {
  const map = modify(empty());
  t.is(commit(map), map);
  t.true(isImmutable(map));
});

test('isImmutable() returns true if the input map is immutable', t => {
  const map = empty();
  t.true(isImmutable(map));
});

test('isImmutable() returns false if the input map is mutable', t => {
  const map = modify(empty());
  t.false(isImmutable(map));
});

test('modify() returns a mutable input map unmodified', t => {
  const map = modify(empty());
  t.is(modify(map), map);
});

test('modify() returns a mutable clone of an immutable input map', t => {
  const map = empty();
  t.not(modify(map), map);
});

test('isMutable() returns true if the input map is mutable', t => {
  const map = modify(empty());
  t.true(isMutable(map));
});

test('isMutable() returns false if the input map is immutable', t => {
  const map = empty();
  t.false(isMutable(map));
});
