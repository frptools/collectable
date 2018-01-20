import test from 'ava';
import { empty, zero } from '../../src';

test('should have size 0', t => {
  const list = empty<string>();
  t.is(list._size, 0);
});

test('zero() is an alias of empty', t => {
  t.is(empty, zero);
});