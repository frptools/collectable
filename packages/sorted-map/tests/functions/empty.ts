import test from 'ava';
import { empty, size } from '../../src';

test('returns a map with size 0', t => {
  t.is(size(empty()), 0);
});

test('always returns the same set instance if called with no arguments', t => {
  const a = empty(), b = empty();
  t.is(a, b);
});
