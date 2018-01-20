import test from 'ava';
import { fromObject, size } from '../../src';
import { unwrap } from '@collectable/core';

test('returns a tree that matches the keys in the source object', t => {
  const source = { a: 1, b: 2, c: 3 };
  const tree = fromObject<number>(source);
  t.is(size(tree), 3);
  t.deepEqual(unwrap(tree), source);
});
