import test from 'ava';
import { empty, size } from '../../src';

test('returns a set with size 0', t => {
  t.is(size(empty()), 0);
});

test('always returns the same set instance', t => {
  const a = empty(), b = empty();
  t.is(a, b);
});
